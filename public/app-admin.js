// =====================================================
        // FIREBASE — use globals set by head initialization
        // =====================================================
        // Re-attempt init in case SDK loaded after head script ran
        if (!window._firebaseLoaded && typeof firebase !== 'undefined') {
            window._initFirebase();
        }
        // Local aliases that always point to working implementations
        let fbAuth    = window.fbAuth;
        let fbDb      = window.fbDb;
        let fbStorage = window.fbStorage;
        // Keep them in sync if Firebase loads asynchronously
        Object.defineProperty(window, 'fbAuth',    { get: () => fbAuth,    set: v => { fbAuth = v; },    configurable: true });
        Object.defineProperty(window, 'fbDb',      { get: () => fbDb,      set: v => { fbDb = v; },      configurable: true });
        Object.defineProperty(window, 'fbStorage', { get: () => fbStorage, set: v => { fbStorage = v; }, configurable: true });

        function _serverTimestamp() {
            try {
                if (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue)
                    return firebase.firestore.FieldValue.serverTimestamp();
            } catch(e) {}
            return new Date();
        }

        // =====================================================
        // CLOUDINARY CONFIG — read from window._appConfig
        // Keys are fetched from /api/config at runtime.
        // =====================================================
        const _adminCloud   = window._appConfig && window._appConfig.cloudinary;
        const CLOUDINARY_CLOUD  = (_adminCloud && _adminCloud.cloud)  || '';
        const CLOUDINARY_PRESET = (_adminCloud && _adminCloud.preset) || '';
        const CLOUDINARY_URL    = CLOUDINARY_CLOUD
            ? 'https://api.cloudinary.com/v1_1/' + CLOUDINARY_CLOUD + '/auto/upload'
            : '';

        // Expose uploadToCloudinary globally so secondary scripts can call it
        window.uploadToCloudinary = async function uploadToCloudinary(file, onProgress) {
            if (!file || !(file instanceof File)) {
                // Not a real file — return as-is if it's already a URL string
                if (typeof file === 'string') return file;
                return Promise.resolve(URL.createObjectURL(file));
            }
            // Always create a local blob URL as immediate fallback
            const localUrl = URL.createObjectURL(file);

            return new Promise((resolve) => {
                // If no network or Cloudinary unreachable, resolve with local URL after 10s
                // On non-localhost environments, don't use blob: URLs as fallback
                // (they're session-only and break on GitHub Pages, custom domains, etc.)
                const _useLocalFallback = window._isLocal || window.location.protocol === 'file:';
                const fallbackTimer = setTimeout(() => {
                    console.warn('[Upload] Cloud upload timed out');
                    if(_useLocalFallback){
                        resolve(localUrl);
                    } else {
                        // On hosted environments, reject so caller can show error
                        console.error('[Upload] Cloudinary timeout on hosted env — check preset/network');
                        resolve(null); // caller must handle null
                    }
                }, 15000); // 15 second max wait on hosted

                const fd = new FormData();
                fd.append('file', file);
                fd.append('upload_preset', CLOUDINARY_PRESET);
                fd.append('tags', 'empyrean_app');
                const xhr = new XMLHttpRequest();
                xhr.open('POST', CLOUDINARY_URL, true);
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const pct = Math.round((e.loaded / e.total) * 100);
                        if (onProgress) onProgress(pct);
                        document.querySelectorAll('.upload-progress-bar').forEach(bar => {
                            bar.style.width = pct + '%';
                            bar.style.background = 'linear-gradient(90deg,#00897B,#4CAF50)';
                        });
                    }
                };
                xhr.onload = () => {
                    clearTimeout(fallbackTimer);
                    if (xhr.status === 200) {
                        try {
                            const res = JSON.parse(xhr.responseText);
                            const cloudUrl = res.secure_url || localUrl;
                            // Upload monitoring log
                            console.info('[Cloudinary] ✅ Upload successful:', {
                                public_id: res.public_id,
                                format: res.format,
                                size_kb: Math.round((res.bytes||0)/1024),
                                url: cloudUrl.substring(0, 60) + '...'
                            });
                            // Track upload count for monitoring
                            window._cloudinaryUploads = (window._cloudinaryUploads || 0) + 1;
                            resolve(cloudUrl);
                        } catch(e) { resolve(localUrl); }
                    } else {
                        console.warn('[Cloudinary] ⚠ Upload error ' + xhr.status + ' — using local blob URL');
                        resolve(localUrl);
                    }
                };
                xhr.onerror = () => { clearTimeout(fallbackTimer); if(_useLocalFallback){resolve(localUrl);}else{console.error('[Cloudinary] Upload failed — check CORS/preset settings');resolve(null);} };
                xhr.ontimeout = () => { clearTimeout(fallbackTimer); if(_useLocalFallback){resolve(localUrl);}else{resolve(null);} };
                xhr.timeout = 10000;
                xhr.send(fd);
            });
        };
        const uploadToCloudinary = window.uploadToCloudinary;

        async function uploadMediaFilesToCloudinary(files, onProgress) {
            if (!files || files.length === 0) return [];
            const uploads = Array.from(files).map(async (file, idx) => {
                if (!(file instanceof File)) {
                    return file._cloudUrl || (typeof file === 'string' ? file : (file.url || ''));
                }
                // Validate file size (max 100MB)
                if (file.size > 100 * 1024 * 1024) {
                    if (typeof showNotification === 'function') showNotification(`"${file.name}" is too large (max 100MB).`, 'error');
                    return URL.createObjectURL(file);
                }
                try {
                    const url = await uploadToCloudinary(file, (pct) => {
                        if (onProgress) onProgress(idx, pct);
                    });
                    file._cloudUrl = url;
                    return url;
                } catch(err) {
                    console.warn('Upload error for file', file.name, err.message);
                    if (typeof showNotification === 'function') showNotification('Upload failed: ' + err.message, 'error');
                    return file._cloudUrl || URL.createObjectURL(file);
                }
            });
            return Promise.all(uploads);
        }
        window.uploadMediaFilesToCloudinary = uploadMediaFilesToCloudinary;

        // =====================================================
        // FLUTTERWAVE PAYMENT GATEWAY — keys from /api/config
        // FLW_SECRET_KEY and FLW_ENCRYPTION_KEY live on the
        // server only — never sent to the browser.
        // =====================================================
        const _adminFlw = window._appConfig && window._appConfig.flutterwave;
        const FLW_PUBLIC_KEY = (_adminFlw && _adminFlw.publicKey) || '';

        // SDK queue — ensures callers never hit "FlutterwaveCheckout is not defined"
        window._flwSDKLoaded  = (typeof FlutterwaveCheckout !== 'undefined');
        window._flwSDKLoading = false;
        window._flwSDKQueue   = [];

        window._ensureFlutterwaveSDK = function(callback) {
            if (typeof FlutterwaveCheckout !== 'undefined') {
                window._flwSDKLoaded = true;
                callback();
                return;
            }
            window._flwSDKQueue.push(callback);
            if (window._flwSDKLoading) return; // already loading, will drain queue on load
            window._flwSDKLoading = true;
            const s = document.createElement('script');
            s.src = 'https://checkout.flutterwave.com/v3.js';
            s.onload = function() {
                window._flwSDKLoaded = true;
                window._flwSDKLoading = false;
                console.info('[FLW] ✅ SDK loaded');
                window._flwSDKQueue.forEach(function(fn) { try { fn(); } catch(e) {} });
                window._flwSDKQueue = [];
            };
            s.onerror = function() {
                window._flwSDKLoading = false;
                window._flwSDKQueue = [];
                if (typeof window.showNotification === 'function')
                    window.showNotification('Payment gateway unavailable. Please check your connection.', 'error');
            };
            document.head.appendChild(s);
        };

        // Pre-load SDK at startup so first payment click is instant
        if (!window._flwSDKLoaded) {
            window._ensureFlutterwaveSDK(function() {
                console.info('[FLW] Payment gateway ready');
            });
        }

        function initiateFlutterwavePayment(opts) {
            if (!opts || !opts.amount || parseFloat(opts.amount) < 1) {
                console.error('[FLW] Invalid payment options — amount required');
                if (opts && opts.onFailure) opts.onFailure({ status: 'error', message: 'Invalid payment amount' });
                return;
            }
            const txRef = 'EMPY-' + Date.now() + '-' + Math.floor(Math.random() * 10000);

            window._ensureFlutterwaveSDK(function() {
                try {
                    FlutterwaveCheckout({
                        public_key: FLW_PUBLIC_KEY,
                        tx_ref: txRef,
                        amount: parseFloat(opts.amount),
                        currency: opts.currency || 'NGN',
                        payment_options: 'card,ussd,banktransfer,mobilemoney,barter,nqr',
                        customer: {
                            email:        opts.email || (window.userState && window.userState.email) || 'user@empyrean.com',
                            phone_number: opts.phone || (window.userState && window.userState.phone) || '',
                            name:         opts.name  || (window.userState && window.userState.fullName) || 'Empyrean User'
                        },
                        customizations: {
                            title:       'Empyrean Humanitarian Platform',
                            description: opts.description || 'Payment',
                            logo:        'https://cdn-icons-png.flaticon.com/512/6001/6001527.png'
                        },
                        meta: {
                            source:   'empyrean_app',
                            purpose:  opts.purpose || 'general',
                            userId:   (window.userState && window.userState.id) || 'guest',
                            encryption_key: FLW_ENCRYPTION_KEY
                        },
                        callback: function(response) {
                            if (response.status === 'successful' || response.status === 'completed') {
                                // Persist transaction to Firestore
                                try {
                                    if (window.fbDb && window._firebaseLoaded) {
                                        window.fbDb.collection('flw_transactions').doc(txRef).set({
                                            txRef,
                                            flwRef:   response.flw_ref || response.transaction_id || '',
                                            amount:   parseFloat(opts.amount),
                                            currency: opts.currency || 'NGN',
                                            purpose:  opts.purpose || 'general',
                                            status:   'successful',
                                            userId:   (window.userState && window.userState.id) || 'guest',
                                            userEmail: opts.email || (window.userState && window.userState.email) || '',
                                            createdAt: _serverTimestamp()
                                        }).catch(function(e) { console.error('[FLW] Firestore save error:', e.message); });
                                    }
                                } catch(e) {}
                                if (opts.onSuccess) opts.onSuccess(response, txRef);
                            } else {
                                if (opts.onFailure) opts.onFailure(response);
                            }
                        },
                        onclose: function() { if (opts.onClose) opts.onClose(); }
                    });
                } catch(flwErr) {
                    console.error('[FLW] FlutterwaveCheckout error:', flwErr.message);
                    if (opts.onFailure) opts.onFailure({ status: 'error', message: flwErr.message });
                }
            });
        }

        // Expose globally for use by all scripts
        window.initiateFlutterwavePayment = initiateFlutterwavePayment;
        window._flwPublicKey = FLW_PUBLIC_KEY;

        // Firebase user helpers
        async function saveUserToFirestore(uid, userData) {
            // Ensure real Firebase is ready before saving
            if (!window._firebaseLoaded) {
                console.warn('[saveUser] Firebase not ready — queuing retry in 2s');
                return new Promise((resolve) => {
                    setTimeout(async () => { try { await saveUserToFirestore(uid, userData); } catch(e){} resolve(); }, 2000);
                });
            }
            const safe = { ...userData };
            ['likedPostIds','followedUserIds','retweetedPostIds','awardedRanks','completedTasks','viewedStatusUserIds']
                .forEach(k => { if (safe[k] instanceof Set) safe[k] = [...safe[k]]; });
            delete safe.password;
            safe.updatedAt = _serverTimestamp();
            try {
                await fbDb.collection('users').doc(uid).set(safe, { merge: true });
                console.log('[Firestore] ✅ User profile saved for uid:', uid);
            } catch(err) {
                console.error('[Firestore] ❌ User save failed:', err.message);
                throw err;
            }
        }
        async function loadUserFromFirestore(uid) {
            const doc = await fbDb.collection('users').doc(uid).get();
            if (!doc.exists) return null;
            const data = doc.data();
            ['likedPostIds','followedUserIds','retweetedPostIds','awardedRanks','completedTasks','viewedStatusUserIds']
                .forEach(k => { data[k] = new Set(data[k] || []); });
            return data;
        }

        // ═══════════════════════════════════════════════════════════════════
        // ADMIN PANEL — TAB SWITCHING
        // Wires up all .admin-nav-tab buttons including the new Disbursements tab
        // ═══════════════════════════════════════════════════════════════════
        (function initAdminTabSwitching() {
            const adminSection = document.getElementById('admin');
            if (!adminSection) return;

            function switchAdminTab(targetId) {
                adminSection.querySelectorAll('.admin-nav-tab').forEach(function(b) {
                    const isActive = b.dataset.tab === targetId;
                    b.classList.toggle('active', isActive);
                    b.style.background = isActive ? 'var(--g-navy)' : 'transparent';
                    b.style.color      = isActive ? 'white' : 'var(--text-muted)';
                });
                adminSection.querySelectorAll('.admin-tab-content').forEach(function(panel) {
                    panel.style.display = panel.id === targetId ? 'block' : 'none';
                });
                if (targetId === 'admin-disburse-tab') {
                    _adminLoadNgoList();
                    _adminLoadRecentDisbursements();
                }
            }

            adminSection.addEventListener('click', function(e) {
                const btn = e.target.closest('.admin-nav-tab');
                if (btn && btn.dataset.tab) switchAdminTab(btn.dataset.tab);
            });

            window._switchAdminTab = switchAdminTab;
            console.log('[Admin] ✅ Tab switching wired');
        })();

        // ═══════════════════════════════════════════════════════════════════
        // ADMIN PANEL — MASTER DELETE (testnet cleanup)
        // ═══════════════════════════════════════════════════════════════════
        window._adminMasterDelete = async function() {
            // window.isAdmin is what login actually sets via initializeApp
            // window.userState.isAdmin is never populated — never use it as sole guard
            if (!window.isAdmin && !(window.userState && window.userState.isAdmin)) {
                if (typeof showNotification === 'function') showNotification('Admin access required.', 'error');
                return;
            }
            const confirmed = confirm(
                '⚠️  TESTNET MASTER DELETE\n\n' +
                'This permanently removes all selected test content from Firestore.\n' +
                'This action CANNOT be undone.\n\nContinue?'
            );
            if (!confirmed) return;
            const confirmed2 = confirm('Final check — are you absolutely sure you want to DELETE all selected test content?');
            if (!confirmed2) return;

            const delPosts   = document.getElementById('del-check-posts')?.checked;
            const delReels   = document.getElementById('del-check-reels')?.checked;
            const delMarket  = document.getElementById('del-check-market')?.checked;
            const delNews    = document.getElementById('del-check-news')?.checked;
            const delSos     = document.getElementById('del-check-sos')?.checked;
            const delCrisis  = document.getElementById('del-check-crisis')?.checked;
            const delProfile = document.getElementById('del-check-profile-posts')?.checked;

            const btn    = document.getElementById('master-delete-btn');
            const prog   = document.getElementById('master-delete-progress');
            const bar    = document.getElementById('master-delete-bar');
            const status = document.getElementById('master-delete-status');

            if (!window._firebaseLoaded) {
                if (typeof showNotification === 'function') showNotification('Firebase not ready. Please wait.', 'error');
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting…';
            btn.style.background = '';
            prog.style.display = 'block';
            bar.style.width = '0%';
            bar.style.background = 'var(--danger-color)';

            const collections = [];
            const _seen = {};
            const _add = function(n,l){if(!_seen[n]){_seen[n]=true;collections.push({name:n,label:l});}};
            if (delPosts)   _add('posts','Posts & Feed');
            if (delReels)   _add('reels','Reels');
            if (delMarket)  _add('marketplace_listings','Marketplace');
            if (delNews)    { _add('news_posts','News (news_posts)'); _add('news_articles','News (news_articles)'); }
            if (delSos)     _add('sos_queue','SOS Requests');
            if (delCrisis)  _add('crisis_reports','Crisis Reports');
            if (delProfile) _add('posts','Profile Dashboard Posts');

            if (!collections.length) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-trash-alt"></i> Execute Master Delete';
                if (typeof showNotification === 'function') showNotification('Please select at least one collection to delete.', 'error');
                return;
            }

            let step = 0;
            const total = collections.length;

            async function deleteCollection(colName, label) {
                let totalDeleted = 0;
                let snap = await fbDb.collection(colName).limit(400).get();
                while (!snap.empty) {
                    const batch = fbDb.batch();
                    snap.docs.forEach(function(doc) { batch.delete(doc.ref); });
                    await batch.commit();
                    totalDeleted += snap.docs.length;
                    status.textContent = label + ': ' + totalDeleted + ' records deleted…';
                    snap = await fbDb.collection(colName).limit(400).get();
                }
                return totalDeleted;
            }

            try {
                for (const col of collections) {
                    step++;
                    const pct = Math.round((step / total) * 90);
                    bar.style.width = pct + '%';
                    status.textContent = 'Processing: ' + col.label + '…';
                    const n = await deleteCollection(col.name, col.label);
                    console.log('[MasterDelete] Cleared', n, 'docs from', col.name);
                }

                // Audit log
                try {
                    await fbDb.collection('admin_audit').add({
                        action:      'MASTER_DELETE_TESTNET',
                        adminId:     window.userState.id,
                        adminEmail:  window.userState.email || '',
                        collections: collections.map(function(c) { return c.name; }),
                        timestamp:   _serverTimestamp()
                    });
                } catch(auditErr) { console.warn('Audit log failed:', auditErr.message); }

                bar.style.width      = '100%';
                bar.style.background = 'var(--success-color, #22c55e)';
                status.textContent   = '✅ Master delete complete. Refresh the page to update the feed.';
                btn.innerHTML        = '<i class="fas fa-check"></i> Deletion Complete';
                btn.style.background = 'var(--success-color, #22c55e)';
                if (typeof showNotification === 'function') showNotification('All selected test content deleted successfully.', 'success');
            } catch(err) {
                console.error('[MasterDelete] Error:', err);
                bar.style.width    = '0%';
                status.textContent = '❌ Error: ' + err.message;
                btn.disabled       = false;
                btn.innerHTML      = '<i class="fas fa-trash-alt"></i> Execute Master Delete';
                if (typeof showNotification === 'function') showNotification('Delete failed: ' + err.message, 'error');
            }
        };

        // ═══════════════════════════════════════════════════════════════════
        // ADMIN PANEL — DISBURSEMENTS
        // Vault connect, NGO loading, fiat + crypto disbursement
        // ═══════════════════════════════════════════════════════════════════

        // Contract addresses (mirrors contractAddresses in app-fixes.js)
        const _DISBURSE = {
            registryAddr:  '0xc861e3ae9a35336c9735692d788065c4a0e37ebb',
            empyTokenAddr: '0x624ca3Db53adb41944EbF2BcB015f68C7BAB0c02',
            usdtAddr:      '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            provider:      null,
            signer:        null,
            walletAddr:    null,
            connected:     false
        };

        const _REGISTRY_ABI = [
            'function recordOffChainGrant(address _recipient, uint256 _amount, string _currency, string _projectId, string _transactionReference) external',
            'function recordOnChainGrant(address _recipient, address _tokenAddress, uint256 _amount, string _projectId) external',
            'function getVerifiedNgoCount() external view returns (uint256)'
        ];
        const _ERC20_ABI = [
            'function transfer(address to, uint256 amount) external returns (bool)',
            'function balanceOf(address account) external view returns (uint256)',
            'function decimals() external view returns (uint8)'
        ];

        // Helper: update vault status badge
        function _setVaultBadge(connected, label) {
            const badge = document.getElementById('vault-status-badge');
            if (!badge) return;
            badge.textContent   = connected ? '● CONNECTED' : ('● ' + (label || 'DISCONNECTED'));
            badge.style.background = connected ? 'rgba(0,137,123,0.1)' : 'rgba(239,68,68,0.1)';
            badge.style.color      = connected ? 'var(--success-color, #22c55e)' : 'var(--danger-color)';
        }

        // Connect MetaMask → Ethers provider → read vault balances
        window._adminConnectVault = async function() {
            var _cvBtn = document.querySelector('button[onclick="window._adminConnectVault()"]');
            function _cvBtn2(lbl,icon,dis,bg){if(_cvBtn){_cvBtn.disabled=dis;_cvBtn.innerHTML='<i class="fas '+icon+'"></i> '+lbl;_cvBtn.style.background=bg||'';}}
            if (typeof window.ethereum === 'undefined') {
                _setVaultBadge(false,'NO METAMASK');
                _cvBtn2('No MetaMask','fa-exclamation-triangle',false,'var(--danger-color)');
                if (typeof showNotification === 'function')
                    showNotification('MetaMask not installed. Install MetaMask to use vault.', 'error');
                return;
            }
            if (typeof ethers === 'undefined' || !ethers) {
                _setVaultBadge(false,'LIB ERROR');
                _cvBtn2('Library Error','fa-exclamation-triangle',false,'var(--danger-color)');
                if (typeof showNotification === 'function')
                    showNotification('Blockchain library not loaded. Please refresh.', 'error');
                return;
            }
            _setVaultBadge(false, 'CONNECTING…');
            _cvBtn2('Connecting…','fa-spinner fa-spin',true,'');
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer   = provider.getSigner();
                const addr     = await signer.getAddress();

                _DISBURSE.provider   = provider;
                _DISBURSE.signer     = signer;
                _DISBURSE.walletAddr = addr;
                _DISBURSE.connected  = true;

                // Read EMPY balance
                let empyBal = '—', usdtBal = '—';
                try {
                    const empyC = new ethers.Contract(_DISBURSE.empyTokenAddr, _ERC20_ABI, provider);
                    const rawEmpy = await empyC.balanceOf(addr);
                    const decEmpy = await empyC.decimals();
                    empyBal = parseFloat(ethers.utils.formatUnits(rawEmpy, decEmpy)).toLocaleString('en-NG', { maximumFractionDigits: 2 }) + ' EMPY';
                } catch(e) { empyBal = 'N/A'; }
                try {
                    const usdtC = new ethers.Contract(_DISBURSE.usdtAddr, _ERC20_ABI, provider);
                    const rawUsdt = await usdtC.balanceOf(addr);
                    usdtBal = parseFloat(ethers.utils.formatUnits(rawUsdt, 6)).toLocaleString('en-NG', { maximumFractionDigits: 2 }) + ' USDT';
                } catch(e) { usdtBal = 'N/A'; }

                _setVaultBadge(true);
                const infoRow = document.getElementById('vault-info-row');
                if (infoRow) infoRow.style.display = 'block';
                const elEmpy = document.getElementById('vault-bal-empy');
                const elUsdt = document.getElementById('vault-bal-usdt');
                const elAddr = document.getElementById('vault-wallet-addr');
                if (elEmpy) elEmpy.textContent = empyBal;
                if (elUsdt) elUsdt.textContent = usdtBal;
                if (elAddr) elAddr.textContent = addr.slice(0, 6) + '…' + addr.slice(-4);

                _cvBtn2('Vault Connected','fa-check-circle',false,'var(--success-color,#22c55e)');
                if (typeof showNotification === 'function') showNotification('Vault connected: ' + addr.slice(0,6) + '…' + addr.slice(-4), 'success');
            } catch(err) {
                _setVaultBadge(false, 'FAILED');
                _cvBtn2('Connect Vault','fa-plug',false,'');
                if (typeof showNotification === 'function') showNotification('Vault connection failed: ' + (err.message||'User rejected'), 'error');
                console.error('[Vault] Connect error:', err);
            }
        };

        // Toggle crypto token row visibility
        window._adminDisbModeChange = function() {
            const mode = document.getElementById('disb-mode')?.value;
            const cryptoRow = document.getElementById('disb-crypto-row');
            if (cryptoRow) cryptoRow.style.display = mode === 'crypto' ? 'block' : 'none';
        };

        // Toggle NGO / Individual panels
        window._adminDisbRecipChange = function() {
            const val = document.querySelector('input[name="disb-recip-type"]:checked')?.value;
            const ngoPanel  = document.getElementById('disb-ngo-panel');
            const indPanel  = document.getElementById('disb-individual-panel');
            if (ngoPanel)  ngoPanel.style.display  = val === 'ngo'        ? 'block' : 'none';
            if (indPanel)  indPanel.style.display  = val === 'individual' ? 'block' : 'none';
        };

        // Load NGO partners into the multi-select list
        window._adminLoadNgoList = async function() {
            const list = document.getElementById('disb-ngo-list');
            if (!list) return;
            list.innerHTML = '<div style="color:var(--text-muted);font-size:0.88rem;padding:10px;">Loading…</div>';

            // Try Firestore ngo_partners collection first, fall back to mockNgoPartners
            let ngos = [];
            try {
                if (window._firebaseLoaded) {
                    const snap = await fbDb.collection('ngo_partners').limit(60).get();
                    snap.forEach(function(doc) {
                        const d = doc.data();
                        ngos.push({ id: doc.id, name: d.name || d.orgName || doc.id, wallet: d.walletAddress || d.wallet || '', email: d.email || '' });
                    });
                }
            } catch(e) {}

            // Merge with mockNgoPartners if available
            if (window.mockNgoPartners && typeof window.mockNgoPartners === 'object') {
                Object.values(window.mockNgoPartners).forEach(function(ngo) {
                    if (!ngos.find(function(n) { return n.id === ngo.id; })) {
                        ngos.push({ id: ngo.id, name: ngo.name || ngo.id, wallet: ngo.wallet || ngo.walletAddress || '', email: ngo.email || '' });
                    }
                });
            }

            if (!ngos.length) {
                list.innerHTML = '<div style="color:var(--text-muted);font-size:0.88rem;padding:10px;">No NGO partners found. Register partners via the Publish → NGO Partners section.</div>';
                return;
            }

            list.innerHTML = ngos.map(function(ngo) {
                return '<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;border:1.5px solid rgba(10,14,39,0.08);border-radius:12px;cursor:pointer;font-size:0.88rem;background:white;">' +
                    '<input type="checkbox" class="disb-ngo-chk" data-id="' + ngo.id + '" data-name="' + (ngo.name).replace(/"/g,'&quot;') + '" data-wallet="' + (ngo.wallet||'') + '" data-email="' + (ngo.email||'') + '" style="width:15px;height:15px;accent-color:var(--secondary);flex-shrink:0;">' +
                    '<span><strong>' + ngo.name + '</strong>' + (ngo.wallet ? '<br><span style="font-size:0.75rem;color:var(--text-muted);font-family:monospace;">' + ngo.wallet.slice(0,10) + '…</span>' : '') + '</span>' +
                    '</label>';
            }).join('');
        };

        // Load recent disbursements from Firestore
        window._adminLoadRecentDisbursements = async function() {
            const tbody = document.getElementById('disb-history-body');
            if (!tbody) return;
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text-muted);">Loading…</td></tr>';
            if (!window._firebaseLoaded) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text-muted);">Firebase not connected.</td></tr>';
                return;
            }
            try {
                const snap = await fbDb.collection('disbursements').orderBy('createdAt', 'desc').limit(30).get();
                if (snap.empty) {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--text-muted);">No disbursements recorded yet.</td></tr>';
                    return;
                }
                let rows = '';
                snap.forEach(function(doc) {
                    const d  = doc.data();
                    const dt = d.createdAt && d.createdAt.toDate ? d.createdAt.toDate().toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }) : '—';
                    const statusColor = d.status === 'completed' ? 'var(--success-color,#22c55e)' : d.status === 'failed' ? 'var(--danger-color)' : '#F59E0B';
                    rows += '<tr style="border-bottom:1px solid rgba(10,14,39,0.06);">' +
                        '<td style="padding:10px 14px;white-space:nowrap;">' + dt + '</td>' +
                        '<td style="padding:10px 14px;">' + (d.recipientName || d.recipientId || '—') + '</td>' +
                        '<td style="padding:10px 14px;font-weight:700;">' + (d.amountFormatted || d.amount || '—') + '</td>' +
                        '<td style="padding:10px 14px;">' + (d.mode || '—') + '</td>' +
                        '<td style="padding:10px 14px;">' + (d.purpose || '—') + '</td>' +
                        '<td style="padding:10px 14px;"><span style="font-weight:700;color:' + statusColor + ';">' + (d.status || 'pending') + '</span></td>' +
                        '</tr>';
                });
                tbody.innerHTML = rows;
            } catch(err) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--danger-color);">Error: ' + err.message + '</td></tr>';
            }
        };

        // Append a live row to the Grant Transparency Portal after disbursement
        function _appendGrantLedgerRow(rec) {
            var tbody = document.getElementById('grant-ledger-body');
            if (!tbody) return;
            var empty = tbody.querySelector('td[colspan]');
            if (empty) empty.closest('tr').remove();
            var gid  = 'G-' + Date.now().toString(36).toUpperCase().slice(-6);
            var dt   = new Date().toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'});
            var txTxt = rec.txHash ? rec.txHash.slice(0,16)+'..' : rec.txRef ? rec.txRef.slice(0,16)+'..' : 'pending';
            var txUrl = rec.txHash ? 'https://polygonscan.com/tx/'+rec.txHash : '#';
            var tr = document.createElement('tr');
            tr.innerHTML =
                '<td>'+gid+'</td>'+
                '<td>'+(rec.recipientName||'—')+'</td>'+
                '<td>'+(rec.purpose||'—')+'</td>'+
                '<td>'+(rec.amountFormatted||rec.amount||'—')+'</td>'+
                '<td><a href="'+txUrl+'" target="_blank" style="color:var(--secondary);font-family:monospace;font-size:0.82rem;">'+txTxt+'</a></td>'+
                '<td style="color:var(--success-color,#22c55e);font-weight:700;">completed</td>'+
                '<td>'+dt+'</td>';
            tbody.prepend(tr);
        }

                // Show feedback inside disbursement form
        function _disbFeedback(msg, type) {
            const el = document.getElementById('disb-feedback');
            if (!el) return;
            el.style.display    = 'block';
            el.style.background = type === 'error' ? 'rgba(239,68,68,0.1)' : type === 'success' ? 'rgba(0,137,123,0.1)' : 'rgba(245,158,11,0.1)';
            el.style.color      = type === 'error' ? 'var(--danger-color)' : type === 'success' ? 'var(--success-color,#22c55e)' : '#d97706';
            el.style.border     = '1.5px solid currentColor';
            el.textContent      = msg;
        }

        // Main disbursement initiator
        window._adminInitiateDisbursement = async function() {
            const amount    = parseFloat(document.getElementById('disb-amount')?.value || '0');
            const mode      = document.getElementById('disb-mode')?.value;
            const purpose   = document.getElementById('disb-purpose')?.value?.trim();
            const recipType = document.querySelector('input[name="disb-recip-type"]:checked')?.value || 'ngo';
            const token     = document.querySelector('input[name="disb-token"]:checked')?.value || 'empy';
            const _dBtn     = document.querySelector('button[onclick="window._adminInitiateDisbursement()"]');
            const _lock   = function(){if(_dBtn){_dBtn.disabled=true; _dBtn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Processing…';}};
            const _unlock = function(){if(_dBtn){_dBtn.disabled=false;_dBtn.innerHTML='<i class="fas fa-paper-plane"></i> Initiate Disbursement';}};

            // Validate
            if (!amount || amount < 1) return _disbFeedback('Please enter a valid amount.', 'error');
            if (!mode)                 return _disbFeedback('Please select a disbursement mode.', 'error');
            if (!purpose)              return _disbFeedback('Please enter a purpose / project ID.', 'error');

            // Gather recipients
            const recipients = [];
            if (recipType === 'ngo') {
                document.querySelectorAll('.disb-ngo-chk:checked').forEach(function(chk) {
                    recipients.push({ id: chk.dataset.id, name: chk.dataset.name, wallet: chk.dataset.wallet, email: chk.dataset.email });
                });
                if (!recipients.length) return _disbFeedback('Please select at least one NGO partner.', 'error');
            } else {
                const addr = document.getElementById('disb-individual-addr')?.value?.trim();
                const name = document.getElementById('disb-individual-name')?.value?.trim() || 'Individual Recipient';
                if (!addr) return _disbFeedback('Please enter a recipient wallet or account number.', 'error');
                recipients.push({ id: addr, name: name, wallet: addr, email: '' });
            }

            _lock();
            _disbFeedback('Processing disbursement…', 'info');

            if (mode === 'fiat') {
                // Fiat via Flutterwave — disburse to each selected recipient
                let processed = 0;
                const perRecipient = Math.floor(amount / recipients.length);

                for (const recip of recipients) {
                    try {
                        await new Promise(function(resolve, reject) {
                            window.initiateFlutterwavePayment({
                                amount:      perRecipient,
                                currency:    'NGN',
                                email:       recip.email || (window.userState && window.userState.email) || 'admin@empyrean.com',
                                name:        recip.name,
                                description: purpose,
                                purpose:     purpose,
                                onSuccess: async function(response, txRef) {
                                    // Record in Firestore
                                    try {
                                        await fbDb.collection('disbursements').add({
                                            recipientId:     recip.id,
                                            recipientName:   recip.name,
                                            recipientWallet: recip.wallet || '',
                                            amount:          perRecipient,
                                            amountFormatted: '₦' + perRecipient.toLocaleString('en-NG'),
                                            mode:            'fiat-ngn',
                                            token:           'NGN',
                                            purpose:         purpose,
                                            txRef:           txRef,
                                            flwRef:          response.flw_ref || '',
                                            status:          'completed',
                                            adminId:         (window.userState && window.userState.id) || '',
                                            createdAt:       _serverTimestamp()
                                        });
                                        // Record off-chain on the registry contract if vault is connected
                                        if (_DISBURSE.connected && _DISBURSE.signer && recip.wallet && recip.wallet.startsWith('0x')) {
                                            try {
                                                const registry = new ethers.Contract(_DISBURSE.registryAddr, _REGISTRY_ABI, _DISBURSE.signer);
                                                await registry.recordOffChainGrant(
                                                    recip.wallet,
                                                    ethers.utils.parseUnits(String(perRecipient), 18),
                                                    'NGN',
                                                    purpose,
                                                    txRef
                                                );
                                            } catch(chainErr) { console.warn('[Disburse] Off-chain record error:', chainErr.message); }
                                        }
                                    } catch(e) { console.warn('[Disburse] Firestore save error:', e.message); }
                                    _appendGrantLedgerRow({recipientName:recip.name,purpose:purpose,amountFormatted:'₦'+perRecipient.toLocaleString('en-NG'),txRef:txRef});
                                    processed++;
                                    resolve();
                                },
                                onFailure: function(res) { reject(new Error(res.message || 'Payment failed')); },
                                onClose:   function()    { reject(new Error('Payment window closed')); }
                            });
                        });
                    } catch(flwErr) {
                        console.warn('[Disburse] FLW error for', recip.name, ':', flwErr.message);
                        _disbFeedback('⚠ Error for '+recip.name+': '+flwErr.message,'error');
                    }
                }
                _unlock();
                if (processed === recipients.length && processed > 0) {
                    _disbFeedback('✅ Fiat disbursement completed for ' + processed + ' recipient(s). Ledger updated.', 'success');
                    window._adminLoadRecentDisbursements();
                } else if (processed > 0) {
                    _disbFeedback('⚠ Partial: ' + processed + ' of ' + recipients.length + ' completed.', 'warning');
                    window._adminLoadRecentDisbursements();
                } else {
                    _disbFeedback('❌ No disbursements completed. Check payment gateway connection.', 'error');
                }

            } else if (mode === 'crypto') {
                // Crypto — requires vault connection
                if (!_DISBURSE.connected || !_DISBURSE.signer) {
                    _unlock();
                    return _disbFeedback('Please connect the vault (MetaMask) before sending crypto.', 'error');
                }
                if (typeof ethers === 'undefined' || !ethers) {
                    _unlock();
                    return _disbFeedback('Blockchain library not loaded. Please refresh.', 'error');
                }
                const tokenAddr = token === 'usdt' ? _DISBURSE.usdtAddr : _DISBURSE.empyTokenAddr;
                const decimals  = token === 'usdt' ? 6 : 18;
                const perRecipient = amount / recipients.length;
                const amtUnits  = ethers.utils.parseUnits(perRecipient.toFixed(decimals > 6 ? 6 : decimals), decimals);
                const tokenLabel = token === 'usdt' ? 'USDT' : 'EMPY';

                let processed = 0;
                const tokenContract  = new ethers.Contract(tokenAddr, _ERC20_ABI, _DISBURSE.signer);
                const registryContract = new ethers.Contract(_DISBURSE.registryAddr, _REGISTRY_ABI, _DISBURSE.signer);

                for (const recip of recipients) {
                    if (!recip.wallet || !recip.wallet.startsWith('0x')) {
                        console.warn('[Disburse] No valid wallet for', recip.name, '— skipping');
                        continue;
                    }
                    try {
                        _disbFeedback('Sending ' + tokenLabel + ' to ' + recip.name + '…', 'info');
                        // ERC-20 transfer
                        const tx = await tokenContract.transfer(recip.wallet, amtUnits);
                        await tx.wait();
                        // Record on-chain in registry
                        try {
                            const regTx = await registryContract.recordOnChainGrant(recip.wallet, tokenAddr, amtUnits, purpose);
                            await regTx.wait();
                        } catch(regErr) { console.warn('[Disburse] Registry record error:', regErr.message); }
                        // Persist to Firestore
                        try {
                            await fbDb.collection('disbursements').add({
                                recipientId:     recip.id,
                                recipientName:   recip.name,
                                recipientWallet: recip.wallet,
                                amount:          perRecipient,
                                amountFormatted: perRecipient.toLocaleString('en', { maximumFractionDigits: 4 }) + ' ' + tokenLabel,
                                mode:            'crypto',
                                token:           tokenLabel,
                                tokenAddress:    tokenAddr,
                                txHash:          tx.hash,
                                purpose:         purpose,
                                status:          'completed',
                                adminId:         (window.userState && window.userState.id) || '',
                                createdAt:       _serverTimestamp()
                            });
                        } catch(firestoreErr) { console.warn('[Disburse] Firestore error:', firestoreErr.message); }
                        _appendGrantLedgerRow({recipientName:recip.name,purpose:purpose,amountFormatted:perRecipient.toLocaleString('en',{maximumFractionDigits:4})+' '+tokenLabel,txHash:tx.hash});
                        processed++;
                    } catch(txErr) {
                        console.error('[Disburse] TX error for', recip.name, ':', txErr.message);
                        _disbFeedback('❌ Failed for ' + recip.name + ': ' + txErr.message, 'error');
                    }
                }
                _unlock();
                if (processed > 0) {
                    _disbFeedback('✅ ' + tokenLabel + ' sent to ' + processed + ' of ' + recipients.length + ' recipient(s). Ledger updated.', 'success');
                    window._adminLoadRecentDisbursements();
                } else {
                    _disbFeedback('❌ No transactions completed. Check wallet addresses and vault.', 'error');
                }
            } else {
                _unlock();
                _disbFeedback('Unknown disbursement mode.', 'error');
            }
        };