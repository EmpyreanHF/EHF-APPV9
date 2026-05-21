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
        // CLOUDINARY CONFIG — read lazily inside each call so
        // /api/config always has time to load before first upload.
        // =====================================================
        function _getCloudinaryConfig() {
            // Always read from window._appConfig fresh — never cache at module scope
            const _cloud = window._appConfig && window._appConfig.cloudinary;
            const cloud  = (_cloud && _cloud.cloud)  || '';
            const preset = (_cloud && _cloud.preset) || '';
            const url    = cloud
                ? 'https://api.cloudinary.com/v1_1/' + cloud + '/auto/upload'
                : '';
            return { cloud, preset, url };
        }

        // Poll until /api/config has populated cloudinary config (max 15 s)
        // FIX 1: Extended from 5 s → 15 s; faster 200 ms tick for quicker detection
        function _waitForCloudinaryConfig() {
            return new Promise(function(resolve) {
                var cfg = _getCloudinaryConfig();
                if (cfg.url) { resolve(cfg); return; }
                var elapsed = 0;
                var t = setInterval(function() {
                    elapsed += 200;
                    cfg = _getCloudinaryConfig();
                    if (cfg.url || elapsed >= 15000) { clearInterval(t); resolve(cfg); }
                }, 200);
            });
        }

        // Expose uploadToCloudinary globally so secondary scripts can call it
        window.uploadToCloudinary = async function uploadToCloudinary(file, onProgress) {
            if (!file || !(file instanceof File)) {
                // Not a real file — return as-is if it's already a URL string
                if (typeof file === 'string') return file;
                return Promise.resolve(URL.createObjectURL(file));
            }

            // Read config fresh; if /api/config hasn't responded yet, wait up to 5 s
            let cfg = _getCloudinaryConfig();
            if (!cfg.url) { cfg = await _waitForCloudinaryConfig(); }
            const CLOUDINARY_PRESET = cfg.preset;
            const CLOUDINARY_URL    = cfg.url;

            if (!CLOUDINARY_URL) {
                console.error('[Cloudinary] ❌ Config not loaded — upload_preset or cloud name missing. Check /api/config is returning cloudinary values.');
                if (typeof showNotification === 'function') showNotification('Upload failed: server config not ready. Please try again in a moment.', 'error');
                // FIX 2: Always reject — never silently resolve with a blob URL.
                // Blob URLs are tab-local and will be saved into Firestore, making
                // media permanently invisible to every other device/user.
                return Promise.reject(new Error('Cloudinary config not loaded'));
            }

            // FIX 3: No pre-created localUrl. Blob URLs must never reach Firestore.
            // The XHR timeout is raised to 60 s to handle large files on slow connections.
            // On any failure we reject so the caller can surface a real error to the user.
            return new Promise((resolve, reject) => {
                const UPLOAD_TIMEOUT_MS = 60000; // 60 s — enough for large files on Lagos 4G

                const fallbackTimer = setTimeout(() => {
                    console.warn('[Upload] Cloud upload timed out after 60 s');
                    if (typeof showNotification === 'function')
                        showNotification('Upload timed out. Check your connection and try again.', 'error');
                    reject(new Error('Upload timed out'));
                }, UPLOAD_TIMEOUT_MS);

                const fd = new FormData();
                fd.append('file', file);
                fd.append('upload_preset', CLOUDINARY_PRESET);
                fd.append('tags', 'empyrean_app');
                const xhr = new XMLHttpRequest();
                xhr.open('POST', CLOUDINARY_URL, true);
                xhr.timeout = UPLOAD_TIMEOUT_MS;
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
                            // FIX 4: Reject if secure_url is missing — never fall back to blob.
                            if (!res.secure_url) {
                                console.error('[Cloudinary] ❌ Response missing secure_url:', res);
                                reject(new Error('Cloudinary returned no secure_url'));
                                return;
                            }
                            console.info('[Cloudinary] ✅ Upload successful:', {
                                public_id: res.public_id,
                                format: res.format,
                                size_kb: Math.round((res.bytes || 0) / 1024),
                                url: res.secure_url.substring(0, 60) + '...'
                            });
                            window._cloudinaryUploads = (window._cloudinaryUploads || 0) + 1;
                            resolve(res.secure_url);
                        } catch(e) {
                            console.error('[Cloudinary] ❌ Failed to parse response:', e);
                            reject(new Error('Failed to parse Cloudinary response'));
                        }
                    } else {
                        console.error('[Cloudinary] ❌ HTTP error ' + xhr.status);
                        reject(new Error('Cloudinary upload failed with HTTP ' + xhr.status));
                    }
                };
                xhr.onerror   = () => { clearTimeout(fallbackTimer); reject(new Error('Network error during upload')); };
                xhr.ontimeout = () => { clearTimeout(fallbackTimer); reject(new Error('XHR timeout during upload')); };
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
                    // FIX 5a: Reject rather than returning a blob — caller must not save this to Firestore
                    return Promise.reject(new Error(file.name + ' exceeds 100 MB limit'));
                }
                try {
                    const url = await uploadToCloudinary(file, (pct) => {
                        if (onProgress) onProgress(idx, pct);
                    });
                    // FIX 5b: Only cache a confirmed Cloudinary https:// URL, never a blob
                    if (url && url.startsWith('https://')) {
                        file._cloudUrl = url;
                    }
                    return url;
                } catch(err) {
                    console.error('[uploadMedia] ❌ Upload failed for', file.name, '—', err.message);
                    if (typeof showNotification === 'function')
                        showNotification('Upload failed for "' + file.name + '": ' + err.message, 'error');
                    // FIX 5c: Re-throw — never silently return a blob URL that would poison Firestore
                    throw err;
                }
            });
            return Promise.all(uploads);
        }
        window.uploadMediaFilesToCloudinary = uploadMediaFilesToCloudinary;

        // =====================================================
        // FLUTTERWAVE PAYMENT GATEWAY — keys from /api/config
        // =====================================================
        const _flw = window._appConfig && window._appConfig.flutterwave;
        const FLW_PUBLIC_KEY = (_flw && _flw.publicKey) || '';
        // FLW_SECRET_KEY and FLW_ENCRYPTION_KEY live only on the server.
        // Transaction verification is proxied through /api/flw/verify.
        function initiateFlutterwavePayment(opts) {
            const txRef = 'EMPY-' + Date.now() + '-' + Math.floor(Math.random()*10000);
            if (typeof FlutterwaveCheckout === 'undefined') {
                console.warn('Flutterwave not loaded — retrying...');
                // Dynamically load if missed on page load
                const s = document.createElement('script');
                s.src = 'https://checkout.flutterwave.com/v3.js';
                s.onload = function() { initiateFlutterwavePayment(opts); };
                s.onerror = function() { if (opts.onFailure) opts.onFailure({ status: 'error', message: 'Payment gateway unavailable' }); };
                document.body.appendChild(s);
                return;
            }
            FlutterwaveCheckout({
                public_key: FLW_PUBLIC_KEY,
                tx_ref: txRef,
                amount: opts.amount,
                currency: opts.currency || 'NGN',
                payment_options: 'card,ussd,banktransfer,mobilemoney',
                customer: {
                    email: opts.email || (window.userState && window.userState.email) || 'user@empyrean.com',
                    phone_number: opts.phone || (window.userState && window.userState.phone) || '',
                    name: opts.name || (window.userState && window.userState.fullName) || 'Empyrean User'
                },
                customizations: {
                    title: 'Empyrean Humanitarian Platform',
                    description: opts.description || 'Payment',
                    logo: window._empyreanLogoSrc || ''
                },
                meta: { verified_server_side: true },   // verification via /api/flw/verify
                callback: function(response) {
                    if (response.status === 'successful') {
                        fbDb.collection('flw_transactions').doc(txRef).set({
                            txRef, amount: opts.amount, currency: opts.currency || 'NGN',
                            purpose: opts.purpose || 'general', status: 'held',
                            createdAt: _serverTimestamp()
                        }).catch(e => console.error('FLW tx save error:', e));
                        if (opts.onSuccess) opts.onSuccess(response, txRef);
                    } else {
                        if (opts.onFailure) opts.onFailure(response);
                    }
                },
                onclose: function() { if (opts.onClose) opts.onClose(); }
            });
        }

        // Firebase user helpers
        async function saveUserToFirestore(uid, userData) {
            // Wait up to 6 s for the real Firebase SDK to be ready
            if (!window._firebaseLoaded || !fbDb || !fbDb.collection) {
                await new Promise(function(resolve) {
                    var waited = 0;
                    var t = setInterval(function() {
                        waited += 300;
                        if ((window._firebaseLoaded && fbDb && fbDb.collection) || waited >= 6000) {
                            clearInterval(t); resolve();
                        }
                    }, 300);
                });
            }
            if (!fbDb || !fbDb.collection) {
                console.error('[saveUser] Firebase unavailable — cannot save uid:', uid);
                return;
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
            // Wait up to 6 s for the real Firebase SDK to be ready
            if (!window._firebaseLoaded || !fbDb || !fbDb.collection) {
                await new Promise(function(resolve) {
                    var waited = 0;
                    var t = setInterval(function() {
                        waited += 300;
                        if ((window._firebaseLoaded && fbDb && fbDb.collection) || waited >= 6000) {
                            clearInterval(t); resolve();
                        }
                    }, 300);
                });
            }
            if (!fbDb || !fbDb.collection) {
                console.error('[loadUser] Firebase unavailable — cannot load uid:', uid);
                return null;
            }
            const doc = await fbDb.collection('users').doc(uid).get();
            if (!doc.exists) return null;
            const data = doc.data();
            ['likedPostIds','followedUserIds','retweetedPostIds','awardedRanks','completedTasks','viewedStatusUserIds']
                .forEach(k => { data[k] = new Set(data[k] || []); });
            return data;
        }