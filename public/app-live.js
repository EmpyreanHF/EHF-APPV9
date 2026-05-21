(function() {
'use strict';

/* ─────────────────────────────────────────────
   PART 0 — GLOBAL closest() SCOPE FIX
   All secondary event listeners that used the
   inner `closest` helper now use e.target.closest
   directly, which is always available.
───────────────────────────────────────────── */
window._agoraAvailable = (typeof AgoraRTC !== 'undefined');

// ============================================================
// LIVE STREAM ENHANCEMENTS: Fullscreen + Swipe navigation
// ============================================================
(function() {
    var activeLiveStreams = []; // registry of live sessions for swipe nav

    // Register a live session so swipe can navigate between them
    window.registerLiveSession = function(streamId, hostName, channelName) {
        if (!activeLiveStreams.find(s => s.streamId === streamId)) {
            activeLiveStreams.push({ streamId, hostName, channelName });
        }
    };

    // Fullscreen toggle for live player
    window.toggleLiveFullscreen = function(containerEl) {
        const el = containerEl || document.getElementById('live-player-container') || document.getElementById('live-stream-player');
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen && el.requestFullscreen();
            el.webkitRequestFullscreen && el.webkitRequestFullscreen();
            el.style.borderRadius = '0';
        } else {
            document.exitFullscreen && document.exitFullscreen();
            el.style.borderRadius = '';
        }
    };

    // Swipe-up/down to navigate live sessions
    var _swipeStartY = 0;
    var _currentLiveIdx = 0;
    var _swipeLocked = false;

    function setupLiveSwipe(container) {
        if (!container || container._liveSwipeBound) return;
        container._liveSwipeBound = true;

        container.addEventListener('touchstart', function(e) {
            _swipeStartY = e.touches[0].clientY;
        }, { passive: true });

        container.addEventListener('touchend', function(e) {
            if (_swipeLocked) return;
            var deltaY = _swipeStartY - e.changedTouches[0].clientY;
            if (Math.abs(deltaY) < 50) return; // minimum swipe distance
            _swipeLocked = true;
            setTimeout(() => { _swipeLocked = false; }, 800);

            if (deltaY > 0) {
                // Swipe UP — next stream
                _currentLiveIdx = Math.min(_currentLiveIdx + 1, activeLiveStreams.length - 1);
            } else {
                // Swipe DOWN — previous stream
                _currentLiveIdx = Math.max(_currentLiveIdx - 1, 0);
            }
            var next = activeLiveStreams[_currentLiveIdx];
            if (next && typeof window.joinLiveAsViewer === 'function') {
                window.joinLiveAsViewer(next.channelName, next.hostName);
                if (typeof window.showNotification === 'function') {
                    window.showNotification('Now watching: ' + next.hostName, 'info');
                }
            }
        }, { passive: true });
    }

    // Attach swipe when live player appears
    document.addEventListener('DOMContentLoaded', function() {
        var liveContainer = document.getElementById('live-player-container') || document.getElementById('go-live');
        if (liveContainer) setupLiveSwipe(liveContainer);

        // Also add fullscreen button when stream starts
        document.addEventListener('click', function(e) {
            var fsBtn = e.target.closest('#live-fullscreen-btn, .live-fullscreen-btn');
            if (fsBtn) {
                var container = fsBtn.closest('.live-player-wrapper, #live-player-container, section#go-live');
                window.toggleLiveFullscreen(container);
            }
        });
    });

    // Auto-setup swipe when live section becomes active
    var _liveMutObs = new MutationObserver(function(muts) {
        muts.forEach(function(m) {
            m.addedNodes.forEach(function(n) {
                if (n.nodeType === 1) {
                    var lp = n.id === 'live-player-container' ? n : n.querySelector && n.querySelector('#live-player-container');
                    if (lp) setupLiveSwipe(lp);
                }
            });
        });
    });
    document.addEventListener('DOMContentLoaded', function() {
        _liveMutObs.observe(document.body, { childList: true, subtree: true });
    });
})();

/* ─────────────────────────────────────────────
   PART 1 — ADMIN TAB NAVIGATION
───────────────────────────────────────────── */
function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
}

onReady(function() {

    // Admin tab switching
    document.addEventListener('click', function(e) {
        const tab = e.target.closest('.admin-nav-tab');
        if (!tab) return;
        const targetId = tab.dataset.tab;
        if (!targetId) return;

        // Update tab button styles
        document.querySelectorAll('.admin-nav-tab').forEach(function(t) {
            t.style.background = 'transparent';
            t.style.color = 'var(--text-muted)';
        });
        tab.style.background = 'var(--g-navy)';
        tab.style.color = 'white';

        // Show/hide tab content
        document.querySelectorAll('.admin-tab-content').forEach(function(c) {
            c.style.display = 'none';
        });
        const target = document.getElementById(targetId);
        if (target) target.style.display = 'block';

        // If users tab opened, populate table
        if (targetId === 'admin-users-tab') {
            populateAdminUsersTable();
        }
    });

    /* ─────────────────────────────────────────────
       PART 2 — AUDIT LOG SYSTEM
    ───────────────────────────────────────────── */
    window.empyreanAuditLog = window.empyreanAuditLog || [];

    window.logAdminAction = function(action, targetUser, details) {
        const entry = {
            timestamp: new Date().toLocaleString(),
            admin: (window.userState && window.userState.email) || 'admin@empyrean.com',
            action: action,
            targetUser: targetUser || '—',
            details: details || ''
        };
        window.empyreanAuditLog.unshift(entry);

        const tbody = document.getElementById('admin-audit-log-body');
        if (!tbody) return;

        // Remove empty state row
        const emptyRow = tbody.querySelector('td[colspan="5"]');
        if (emptyRow) emptyRow.closest('tr').remove();

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(10,14,39,0.05)';
        tr.innerHTML = `
            <td style="padding:12px 16px;font-size:0.82rem;color:var(--text-muted);white-space:nowrap;">${entry.timestamp}</td>
            <td style="padding:12px 16px;font-size:0.82rem;font-weight:600;color:var(--secondary);">${entry.admin}</td>
            <td style="padding:12px 16px;font-size:0.82rem;">
                <span style="background:rgba(27,43,139,0.08);color:var(--secondary);padding:3px 10px;border-radius:8px;font-weight:600;font-size:0.78rem;">${entry.action}</span>
            </td>
            <td style="padding:12px 16px;font-size:0.82rem;color:var(--primary);">${entry.targetUser}</td>
            <td style="padding:12px 16px;font-size:0.82rem;color:var(--text-muted);">${entry.details}</td>
        `;
        tbody.prepend(tr);

        // Persist to Firestore if available
        try {
            if (window.fbDb) {
                window.fbDb.collection('admin_audit_log').add(entry).catch(function() {});
            }
        } catch(e) {}
    };

    /* ─────────────────────────────────────────────
       PART 3 — ADMIN USER MANAGEMENT
    ───────────────────────────────────────────── */
    function getAllUsers() {
        const users = [];
        const seen = new Set();
        // From mockUsers
        if (window.mockUsers) {
            Object.values(window.mockUsers).forEach(function(u) {
                if (u && u.id && !seen.has(u.id)) {
                    seen.add(u.id);
                    users.push(u);
                }
            });
        }
        // From registeredUsers
        if (window.registeredUsers) {
            Object.values(window.registeredUsers).forEach(function(u) {
                if (u && u.id && !seen.has(u.id)) {
                    seen.add(u.id);
                    users.push(u);
                }
            });
        }
        return users;
    }

    function renderUserDetailPanel(user) {
        const panel = document.getElementById('admin-user-detail-panel');
        const content = document.getElementById('admin-user-detail-content');
        if (!panel || !content) return;

        const isBlocked = user._blocked || false;
        content.innerHTML = `
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;flex-wrap:wrap;">
                <img src="${user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName||'U') + '&background=1B2B8B&color=fff&size=80'}"
                     style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:3px solid var(--accent);"
                     onerror="this.src='https://ui-avatars.com/api/?name=U&background=1B2B8B&color=fff&size=80'">
                <div style="flex:1;">
                    <h3 style="margin:0 0 4px;color:var(--primary);">${user.fullName || 'Unknown'}</h3>
                    <p style="margin:0;color:var(--text-muted);font-size:0.88rem;">@${user.username || '—'} · ${user.email || '—'}</p>
                    <p style="margin:4px 0 0;font-size:0.82rem;">
                        <span style="background:rgba(27,43,139,0.08);color:var(--secondary);padding:2px 10px;border-radius:20px;font-weight:700;">
                            ${user.uniqueId || user.id || 'No ID'}
                        </span>
                        ${user.isVerified ? '<span style="background:rgba(16,185,129,0.1);color:#059669;padding:2px 10px;border-radius:20px;font-weight:600;margin-left:6px;">✓ Verified</span>' : ''}
                        ${isBlocked ? '<span style="background:rgba(239,68,68,0.1);color:var(--danger-color);padding:2px 10px;border-radius:20px;font-weight:600;margin-left:6px;">🔒 Blocked</span>' : ''}
                    </p>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:20px;">
                <div style="background:rgba(10,14,39,0.03);border-radius:14px;padding:14px;text-align:center;">
                    <div style="font-size:1.4rem;font-weight:800;color:var(--accent);">${(user.empyBalance||0).toLocaleString()}</div>
                    <div style="font-size:0.78rem;color:var(--text-muted);">EMPY Balance</div>
                </div>
                <div style="background:rgba(10,14,39,0.03);border-radius:14px;padding:14px;text-align:center;">
                    <div style="font-size:1.4rem;font-weight:800;color:var(--secondary);">${(user.followerCount||0).toLocaleString()}</div>
                    <div style="font-size:0.78rem;color:var(--text-muted);">Followers</div>
                </div>
                <div style="background:rgba(10,14,39,0.03);border-radius:14px;padding:14px;text-align:center;">
                    <div style="font-size:1.4rem;font-weight:800;color:var(--accent2);">${user.isVerified ? 'KYC ✓' : 'Unverified'}</div>
                    <div style="font-size:0.78rem;color:var(--text-muted);">KYC Status</div>
                </div>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <button onclick="adminActionUnblock('${user.id}')" style="background:rgba(16,185,129,0.1);color:#059669;border:1.5px solid rgba(16,185,129,0.3);padding:9px 18px;border-radius:12px;cursor:pointer;font-weight:600;font-size:0.85rem;">
                    <i class="fas fa-unlock"></i> ${isBlocked ? 'Unblock' : 'Block'} Account
                </button>
                <button onclick="adminActionVerify('${user.id}')" style="background:rgba(27,43,139,0.08);color:var(--secondary);border:1.5px solid rgba(27,43,139,0.2);padding:9px 18px;border-radius:12px;cursor:pointer;font-weight:600;font-size:0.85rem;">
                    <i class="fas fa-check-circle"></i> ${user.isVerified ? 'Remove Verification' : 'Mark Verified'}
                </button>
                <button onclick="adminActionResetPassword('${user.id}','${user.email}')" style="background:rgba(245,197,24,0.1);color:#92700a;border:1.5px solid rgba(245,197,24,0.3);padding:9px 18px;border-radius:12px;cursor:pointer;font-weight:600;font-size:0.85rem;">
                    <i class="fas fa-key"></i> Reset Password
                </button>
                <button onclick="adminActionAdjustBalance('${user.id}')" style="background:rgba(239,68,68,0.08);color:var(--danger-color);border:1.5px solid rgba(239,68,68,0.2);padding:9px 18px;border-radius:12px;cursor:pointer;font-weight:600;font-size:0.85rem;">
                    <i class="fas fa-coins"></i> Adjust Balance
                </button>
            </div>
        `;
        panel.style.display = 'block';
    }

    window.adminActionUnblock = function(userId) {
        const users = getAllUsers();
        const user = users.find(function(u) { return u.id === userId; });
        if (!user) return;
        user._blocked = !user._blocked;
        const action = user._blocked ? 'BLOCK_ACCOUNT' : 'UNBLOCK_ACCOUNT';
        window.logAdminAction(action, user.fullName + ' (' + (user.email||'') + ')', 'Account ' + (user._blocked ? 'blocked' : 'unblocked'));
        renderUserDetailPanel(user);
        if (typeof window.showNotification === 'function') {
            window.showNotification('Account ' + (user._blocked ? 'blocked' : 'unblocked') + ' for ' + user.fullName, user._blocked ? 'error' : 'success');
        }
    };

    window.adminActionVerify = function(userId) {
        const users = getAllUsers();
        const user = users.find(function(u) { return u.id === userId; });
        if (!user) return;
        user.isVerified = !user.isVerified;
        window.logAdminAction(user.isVerified ? 'VERIFY_USER' : 'UNVERIFY_USER', user.fullName + ' (' + (user.email||'') + ')', 'KYC status changed');
        renderUserDetailPanel(user);
        try {
            if (window.fbDb && user.id) window.fbDb.collection('users').doc(user.id).update({ isVerified: user.isVerified }).catch(function(){});
        } catch(e) {}
        if (typeof window.showNotification === 'function') {
            window.showNotification((user.isVerified ? '✅ Verified' : 'Verification removed for') + ' ' + user.fullName, 'success');
        }
    };

    window.adminActionResetPassword = function(userId, email) {
        if (!email) { if (typeof window.showNotification === 'function') window.showNotification('No email on file.', 'error'); return; }
        try {
            if (window.fbAuth && typeof window.fbAuth.sendPasswordResetEmail === 'function') {
                window.fbAuth.sendPasswordResetEmail(email).then(function() {
                    window.logAdminAction('RESET_PASSWORD', email, 'Password reset email sent');
                    if (typeof window.showNotification === 'function') window.showNotification('Password reset email sent to ' + email, 'success');
                }).catch(function(e) {
                    if (typeof window.showNotification === 'function') window.showNotification('Failed: ' + e.message, 'error');
                });
            } else {
                window.logAdminAction('RESET_PASSWORD', email, 'Reset requested (offline mode)');
                if (typeof window.showNotification === 'function') window.showNotification('Password reset logged (Firebase offline).', 'info');
            }
        } catch(e) {
            if (typeof window.showNotification === 'function') window.showNotification('Error: ' + e.message, 'error');
        }
    };

    window.adminActionAdjustBalance = function(userId) {
        const users = getAllUsers();
        const user = users.find(function(u) { return u.id === userId; });
        if (!user) return;
        const amount = parseFloat(prompt('Enter EMPY adjustment (+ to add, - to deduct):\nCurrent balance: ' + (user.empyBalance||0)));
        if (isNaN(amount)) return;
        user.empyBalance = Math.max(0, (user.empyBalance||0) + amount);
        window.logAdminAction('ADJUST_BALANCE', user.fullName + ' (' + (user.email||'') + ')', (amount > 0 ? '+' : '') + amount + ' EMPY → new balance: ' + user.empyBalance);
        renderUserDetailPanel(user);
        // Sync if this is current user
        if (window.userState && window.userState.id === userId) {
            window.userState.empyBalance = user.empyBalance;
            if (typeof window.updateWalletUI === 'function') window.updateWalletUI();
        }
        try {
            if (window.fbDb && userId) window.fbDb.collection('users').doc(userId).update({ empyBalance: user.empyBalance }).catch(function(){});
        } catch(e) {}
        if (typeof window.showNotification === 'function') window.showNotification('Balance adjusted to ' + user.empyBalance + ' EMPY', 'success');
    };

    function populateAdminUsersTable() {
        const tbody = document.getElementById('admin-all-users-table');
        const badge = document.getElementById('admin-total-users-badge');
        if (!tbody) return;
        const users = getAllUsers();
        if (badge) badge.textContent = users.length + ' user' + (users.length !== 1 ? 's' : '');
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">No registered users yet.</td></tr>';
            return;
        }
        tbody.innerHTML = users.map(function(u) {
            return `<tr style="border-bottom:1px solid rgba(10,14,39,0.05);transition:background 0.15s;" onmouseenter="this.style.background='rgba(27,43,139,0.03)'" onmouseleave="this.style.background=''">
                <td style="padding:12px 16px;font-size:0.78rem;font-weight:700;color:var(--secondary);white-space:nowrap;">${u.uniqueId || u.id || '—'}</td>
                <td style="padding:12px 16px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <img src="${u.avatar||'https://ui-avatars.com/api/?name=U&background=1B2B8B&color=fff&size=40'}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" onerror="this.src='https://ui-avatars.com/api/?name=U&background=1B2B8B&color=fff&size=40'">
                        <div>
                            <div style="font-weight:600;font-size:0.88rem;color:var(--primary);">${u.fullName||'—'}</div>
                            <div style="font-size:0.78rem;color:var(--text-muted);">@${u.username||'—'}</div>
                        </div>
                    </div>
                </td>
                <td style="padding:12px 16px;font-size:0.82rem;color:var(--text-muted);">${u.email||'—'}</td>
                <td style="padding:12px 16px;font-size:0.85rem;font-weight:700;color:var(--accent);">${(u.empyBalance||0).toLocaleString()} EMPY</td>
                <td style="padding:12px 16px;">
                    <span style="font-size:0.78rem;padding:3px 10px;border-radius:20px;font-weight:600;background:${u.isVerified?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.08)'};color:${u.isVerified?'#059669':'var(--danger-color)'};">
                        ${u.isVerified ? '✓ Verified' : 'Unverified'}
                    </span>
                </td>
                <td style="padding:12px 16px;">
                    <span style="font-size:0.78rem;padding:3px 10px;border-radius:20px;font-weight:600;background:${u._blocked?'rgba(239,68,68,0.08)':'rgba(16,185,129,0.1)'};color:${u._blocked?'var(--danger-color)':'#059669'};">
                        ${u._blocked ? '🔒 Blocked' : '✓ Active'}
                    </span>
                </td>
                <td style="padding:12px 16px;">
                    <button onclick="(function(){var users=window.mockUsers&&Object.values(window.mockUsers).concat(window.registeredUsers?Object.values(window.registeredUsers):[]);var u=users.find(function(x){return x&&x.id==='${u.id}'});if(u)renderUserDetailPanelGlobal(u);})()" style="background:var(--g-navy);color:white;border:none;padding:6px 14px;border-radius:10px;cursor:pointer;font-size:0.78rem;font-weight:600;">View</button>
                </td>
            </tr>`;
        }).join('');
    }

    window.renderUserDetailPanelGlobal = renderUserDetailPanel;

    // Admin user search
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#admin-user-search-btn')) return;
        const query = (document.getElementById('admin-user-search-input') || {}).value || '';
        const type = (document.getElementById('admin-user-search-type') || {}).value || 'all';
        const resultsEl = document.getElementById('admin-user-search-results');
        if (!resultsEl) return;
        if (!query.trim()) { resultsEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.88rem;">Enter a search term above.</p>'; return; }

        const q = query.trim().toLowerCase();
        const users = getAllUsers();
        const matches = users.filter(function(u) {
            if (!u) return false;
            if (type === 'id' || type === 'all') {
                if ((u.uniqueId||'').toLowerCase().includes(q) || (u.id||'').toLowerCase().includes(q)) return true;
            }
            if (type === 'username' || type === 'all') {
                if ((u.username||'').toLowerCase().includes(q)) return true;
            }
            if (type === 'email' || type === 'all') {
                if ((u.email||'').toLowerCase().includes(q)) return true;
            }
            return false;
        });

        if (matches.length === 0) {
            resultsEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);"><i class="fas fa-search" style="font-size:2rem;opacity:0.3;display:block;margin-bottom:10px;"></i>No users found matching "' + query + '"</div>';
            return;
        }

        resultsEl.innerHTML = '<p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px;">' + matches.length + ' result(s) found</p>' +
            matches.map(function(u) {
                return `<div style="display:flex;align-items:center;gap:12px;padding:12px;border:1.5px solid rgba(10,14,39,0.08);border-radius:14px;margin-bottom:8px;cursor:pointer;transition:all 0.2s;" onmouseenter="this.style.background='rgba(27,43,139,0.04)'" onmouseleave="this.style.background=''" onclick="renderUserDetailPanelGlobal(${JSON.stringify(u).replace(/"/g,'&quot;')})">
                    <img src="${u.avatar||'https://ui-avatars.com/api/?name=U&background=1B2B8B&color=fff&size=48'}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0;" onerror="this.src='https://ui-avatars.com/api/?name=U&background=1B2B8B&color=fff&size=48'">
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:700;color:var(--primary);font-size:0.92rem;">${u.fullName||'—'}</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);">@${u.username||'—'} · ${u.email||'—'}</div>
                        <div style="font-size:0.76rem;color:var(--secondary);font-weight:600;margin-top:2px;">${u.uniqueId||u.id||'No ID'}</div>
                    </div>
                    <span style="font-size:0.78rem;padding:4px 12px;border-radius:20px;font-weight:600;background:${u.isVerified?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.08)'};color:${u.isVerified?'#059669':'var(--danger-color)'};">
                        ${u.isVerified?'Verified':'Unverified'}
                    </span>
                </div>`;
            }).join('');

        // Auto-show detail for single result
        if (matches.length === 1) renderUserDetailPanel(matches[0]);
        window.logAdminAction('USER_SEARCH', query, 'Type: ' + type + ' · ' + matches.length + ' result(s)');
    });

    /* ─────────────────────────────────────────────
       PART 4 — PROFILE PAGE POST UPLOAD
       Posts from profile appear in dashboard feed too
    ───────────────────────────────────────────── */
    let profilePostMediaFiles = [];

    document.addEventListener('change', function(e) {
        if (!e.target.closest('#profile-post-media-input')) return;
        profilePostMediaFiles = Array.from(e.target.files);
        const preview = document.getElementById('profile-post-media-preview');
        if (!preview) return;
        preview.innerHTML = '';

        var count = profilePostMediaFiles.length;
        // Premium multi-image grid layout
        preview.style.display = 'grid';
        preview.style.gap = '4px';
        preview.style.borderRadius = '14px';
        preview.style.overflow = 'hidden';
        preview.style.marginBottom = '12px';
        if (count === 1) preview.style.gridTemplateColumns = '1fr';
        else if (count === 2) preview.style.gridTemplateColumns = '1fr 1fr';
        else if (count === 3) preview.style.gridTemplateColumns = '2fr 1fr';
        else preview.style.gridTemplateColumns = '1fr 1fr';

        profilePostMediaFiles.forEach(function(file, idx) {
            var url = URL.createObjectURL(file);
            var div = document.createElement('div');
            div.style.cssText = 'position:relative;overflow:hidden;background:#000;height:' + (count===1?'220':'160') + 'px;';
            if (count === 3 && idx === 0) div.style.gridRow = '1 / 3';
            if (count > 4 && idx === 3) {
                div.innerHTML = '<div style="width:100%;height:100%;background:rgba(10,14,39,0.7);display:flex;align-items:center;justify-content:center;color:white;font-size:1.6rem;font-weight:800;">+' + (count-4) + '</div>';
            } else if (idx < 4) {
                div.innerHTML = file.type.startsWith('video/')
                    ? '<video src="' + url + '" style="width:100%;height:100%;object-fit:cover;" muted playsinline></video>'
                    : '<img src="' + url + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy">';
            }
            if (idx < 4) {
                // Remove button
                var rmBtn = document.createElement('button');
                rmBtn.type = 'button';
                rmBtn.style.cssText = 'position:absolute;top:5px;right:5px;background:rgba(239,68,68,0.85);border:none;color:white;border-radius:50%;width:22px;height:22px;font-size:0.75rem;cursor:pointer;z-index:3;display:flex;align-items:center;justify-content:center;';
                rmBtn.innerHTML = '&times;';
                (function(i){ rmBtn.addEventListener('click', function() {
                    profilePostMediaFiles.splice(i, 1);
                    // Re-trigger preview re-render
                    var fakeEvt = new Event('change');
                    var inp = document.getElementById('profile-post-media-input');
                    if (inp) { var dt = new DataTransfer(); profilePostMediaFiles.forEach(function(f){dt.items.add(f);}); try{inp.files=dt.files;}catch(ex){} }
                    div.remove();
                }); })(idx);
                div.appendChild(rmBtn);
                preview.appendChild(div);
            }
        });
    });

    // Profile page retweet button
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#profile-retweet-btn')) return;
        var feedContainer = document.getElementById('feed-container');
        if (!feedContainer) return;
        var latestPost = feedContainer.querySelector('.impact-story:not(.sos-request)');
        if (!latestPost) {
            if (typeof window.showNotification === 'function') window.showNotification('No posts to retweet yet.', 'info');
            return;
        }
        var originalAuthorEl = latestPost.querySelector('.story-user-info strong');
        var originalAuthor = originalAuthorEl ? originalAuthorEl.textContent.trim() : 'Unknown';
        var originalContentEl = latestPost.querySelector('.story-content p, .story-content');
        var originalText = originalContentEl ? originalContentEl.textContent.trim() : '';
        var retweetText = '🔁 Retweeted from @' + originalAuthor + ': ' + originalText.substring(0, 120) + (originalText.length > 120 ? '…' : '');
        var textEl = document.getElementById('profile-post-text');
        var titleEl = document.getElementById('profile-post-title');
        if (textEl) textEl.value = retweetText;
        if (titleEl) titleEl.value = 'Retweet';
        if (typeof window.showNotification === 'function') window.showNotification('Post tweet to publish retweet.', 'info');
        document.getElementById('profile-post-text')?.focus();
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('#profile-post-submit-btn')) return;
        const textEl = document.getElementById('profile-post-text');
        const text = textEl ? textEl.value.trim() : '';
        if (!text && profilePostMediaFiles.length === 0) {
            if (typeof window.showNotification === 'function') window.showNotification('Write something or add media first.', 'error');
            return;
        }
        if (window.isGuest) {
            if (typeof window.showNotification === 'function') window.showNotification('Please log in to post.', 'error');
            return;
        }

        const btn = e.target.closest('#profile-post-submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

        (async function() {
            try {
                let mediaUrls = [];
                if (profilePostMediaFiles.length > 0) {
                    if (typeof window.showNotification === 'function') window.showNotification('Uploading media...', 'info');
                    for (let i = 0; i < profilePostMediaFiles.length; i++) {
                        try {
                            const url = await window.uploadToCloudinary(profilePostMediaFiles[i], null);
                            profilePostMediaFiles[i]._cloudUrl = url;
                            mediaUrls.push({ url: url, type: profilePostMediaFiles[i].type });
                        } catch(uploadErr) {
                            console.warn('Profile media upload failed:', uploadErr.message);
                            mediaUrls.push({ url: URL.createObjectURL(profilePostMediaFiles[i]), type: profilePostMediaFiles[i].type });
                        }
                    }
                }

                const us = window.userState || {};
                const postData = {
                    id: 'post-' + Date.now(),
                    text: text,
                    media: mediaUrls,
                    userId: us.id,
                    username: us.fullName || us.username,
                    avatar: us.avatar || '',
                    createdAt: new Date().toISOString(),
                    likeCount: 0,
                    commentCount: 0
                };

                // Create post element and inject into BOTH dashboard feed and profile feed
                // Build post card HTML directly using resolved cloud URLs
                // This guarantees media appears in ALL feeds without waiting for File reads
                (function injectPostIntoFeeds() {
                    var ts = new Date().toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
                    var avatarSrc = us.avatar || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(us.fullName||'U') + '&background=1B2B8B&color=fff&size=52');

                    // Build media HTML from resolved URLs
                    var mediaHtml = '';
                    if (mediaUrls.length > 0) {
                        var count = mediaUrls.length;
                        var gridStyle = count === 1 ? 'grid-template-columns:1fr;' :
                                        count === 2 ? 'grid-template-columns:1fr 1fr;' :
                                        count === 3 ? 'grid-template-columns:2fr 1fr;' :
                                                      'grid-template-columns:1fr 1fr;';
                        mediaHtml = '<div class="story-media-container" style="display:grid;' + gridStyle + 'gap:3px;border-radius:12px;overflow:hidden;margin:8px 0;">';
                        mediaUrls.forEach(function(m, idx) {
                            if (idx >= 4) return;
                            var url = m.url || m;
                            var isVid = (m.type && m.type.startsWith('video/')) || /\.(mp4|webm|mov)(\?|$)/i.test(url);
                            var itemStyle = 'overflow:hidden;' + (count === 1 ? 'height:280px;' : 'height:180px;') + (count === 3 && idx === 0 ? 'grid-row:1/3;' : '');
                            if (isVid) {
                                mediaHtml += '<div style="' + itemStyle + '"><video src="' + url + '" style="width:100%;height:100%;object-fit:cover;" controls muted playsinline></video></div>';
                            } else {
                                mediaHtml += '<div style="' + itemStyle + '"><img src="' + url + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy"></div>';
                            }
                        });
                        if (mediaUrls.length > 4) {
                            mediaHtml += '<div style="height:180px;background:rgba(10,14,39,0.7);display:flex;align-items:center;justify-content:center;color:white;font-size:1.4rem;font-weight:800;">+' + (mediaUrls.length - 4) + '</div>';
                        }
                        mediaHtml += '</div>';
                    }

                    var postHtml =
                        '<div class="impact-story" data-post-id="' + postData.id + '" data-user-id="' + us.id + '" style="margin-bottom:16px;">' +
                            '<div class="story-header" style="display:flex;align-items:center;gap:10px;padding:12px 16px 0;">' +
                                '<div class="avatar-placeholder" style="width:42px;height:42px;border-radius:50%;overflow:hidden;flex-shrink:0;cursor:pointer;">' +
                                    '<img src="' + avatarSrc + '" style="width:100%;height:100%;object-fit:cover;">' +
                                '</div>' +
                                '<div class="story-user-info">' +
                                    '<strong style="display:block;">' + (us.fullName||us.username||'You') + '</strong>' +
                                    '<span style="font-size:0.75rem;color:var(--text-muted);">' + ts + '</span>' +
                                '</div>' +
                            '</div>' +
                            (text ? '<div class="story-content" style="padding:10px 16px;">' + text + '</div>' : '') +
                            (mediaHtml ? '<div style="padding:0 16px;">' + mediaHtml + '</div>' : '') +
                            '<div class="story-actions">' +
                                '<a class="action-btn like-btn" title="Like"><i class="far fa-heart"></i><span class="like-count">0</span></a>' +
                                '<a class="action-btn comment-btn" title="Comment"><i class="far fa-comment"></i><span class="comment-count">0</span></a>' +
                                '<a class="action-btn share-btn" title="Share"><i class="fas fa-share"></i></a>' +
                                '<a class="action-btn download-media-btn" title="Download"><i class="fas fa-download"></i></a>' +
                                '<span class="action-btn view-count-display" style="margin-left:auto;color:var(--text-muted);font-size:0.72rem;pointer-events:none;display:flex;align-items:center;gap:3px;"><i class="fas fa-eye"></i><span class="view-count">0</span></span>' +
                            '</div>' +
                            '<div class="comment-section"><div class="comment-list"></div><form class="comment-form" novalidate><input type="text" name="comment-text" placeholder="Add a comment..." required><button type="submit"><i class="fas fa-paper-plane"></i></button></form></div>' +
                        '</div>';

                    function makePostEl() {
                        var tmp = document.createElement('div');
                        tmp.innerHTML = postHtml;
                        return tmp.firstElementChild;
                    }

                    // Inject into main dashboard feed
                    var dashFeed = document.getElementById('feed-container');
                    if (dashFeed) {
                        var emptyState = document.getElementById('feed-empty-state');
                        if (emptyState) emptyState.style.display = 'none';
                        dashFeed.prepend(makePostEl());
                    }

                    // Inject into profile dashboard tab (shows immediately, same session)
                    var profileDashFeed = document.getElementById('profile-dash-feed');
                    if (profileDashFeed) {
                        var pdEmpty = profileDashFeed.querySelector('.empty-state, p');
                        if (pdEmpty) pdEmpty.remove();
                        profileDashFeed.prepend(makePostEl());
                    }

                    // Inject into profile posts tab
                    var profilePostsFeed = document.getElementById('profile-posts-feed');
                    if (profilePostsFeed) {
                        var ppEmpty = document.getElementById('profile-posts-empty');
                        if (ppEmpty) ppEmpty.style.display = 'none';
                        profilePostsFeed.prepend(makePostEl());
                    }

                    // Update profile gallery immediately
                    var gallery = document.getElementById('profile-gallery');
                    if (gallery && mediaUrls.length > 0) {
                        var gEmpty = gallery.querySelector('p');
                        if (gEmpty) gEmpty.remove();
                        mediaUrls.forEach(function(m) {
                            var url = m.url || m;
                            var isVid = (m.type && m.type.startsWith('video/')) || /\.(mp4|webm|mov)(\?|$)/i.test(url);
                            var gi = document.createElement('div');
                            gi.style.cssText = 'aspect-ratio:1;border-radius:10px;overflow:hidden;cursor:pointer;';
                            gi.innerHTML = isVid
                                ? '<video src="' + url + '" style="width:100%;height:100%;object-fit:cover;" muted playsinline></video>'
                                : '<img src="' + url + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy">';
                            gallery.prepend(gi);
                        });
                    }
                })();

                // Save to Firestore (real Firebase required for cross-device sync)
                if (!window._firebaseLoaded) {
                    await new Promise(function(resolve) {
                        var t = setInterval(function() { if(window._firebaseLoaded){clearInterval(t);resolve();} }, 500);
                        setTimeout(function(){clearInterval(t);resolve();}, 10000);
                    });
                }
                try {
                    if (window.fbDb && window._firebaseLoaded) {
                        var safePost = {
                            id: postData.id,
                            userId: postData.userId,
                            username: postData.username,
                            avatar: postData.avatar,
                            text: postData.text,
                            media: mediaUrls.filter(function(m){ var u=m.url||m; return u&&!u.startsWith('blob:'); }).map(function(m){ return m.url||m; }),
                            createdAt: postData.createdAt
                        };
                        await window.fbDb.collection('posts').doc(postData.id).set(safePost);
                        console.log('[Profile Post] ✅ Saved to Firestore — visible on ALL devices:', postData.id);
                    }
                } catch(fsErr) {
                    console.error('[Profile Post] ❌ Firestore save failed:', fsErr.message);
                    setTimeout(async function() {
                        try { if(window.fbDb&&window._firebaseLoaded) await window.fbDb.collection('posts').doc(postData.id).set({id:postData.id,userId:postData.userId,username:postData.username,text:postData.text,media:mediaUrls.filter(m=>!(m.url||m).startsWith('blob:')).map(m=>m.url||m),createdAt:postData.createdAt}); } catch(e2) {}
                    }, 3000);
                }

                // Reset form
                if (textEl) textEl.value = '';
                profilePostMediaFiles = [];
                const preview = document.getElementById('profile-post-media-preview');
                if (preview) preview.innerHTML = '';
                const fileInput = document.getElementById('profile-post-media-input');
                if (fileInput) fileInput.value = '';

                if (typeof window.showNotification === 'function') window.showNotification('✅ Posted! Your post is now live on your profile and dashboard.', 'success');
                // Update gallery tab with newly uploaded media
                if (typeof window.populateProfileGallery === 'function' && window.userState) {
                    setTimeout(function() { window.populateProfileGallery(window.userState.id); }, 100);
                }
                // Rewarduser for posting
                if (typeof window.rewardUserForAction === 'function') window.rewardUserForAction('CREATE_POST');
            } catch(err) {
                console.error('Profile post error:', err);
                if (typeof window.showNotification === 'function') window.showNotification('Post failed: ' + (err.message||'try again'), 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-paper-plane"></i> Post';
            }
        })();
    });

    /* ═══════════════════════════════════════════════════════════════
       PART 5 — AGORA LIVE STREAM — PRODUCTION INTEGRATION
       App ID:  056a96cf521d4d06887a84319c62912b
       Channel: empyrean-live (temp token pre-generated)
       Primary Cert: 19f7a01abac04e34a04837dd7667bec9
       Token is for channel "empyrean-live" — expires 24h from issue
       Fallback: getUserMedia local preview when Agora unavailable
    ═══════════════════════════════════════════════════════════════ */
    const AGORA_APP_ID = '056a96cf521d4d06887a84319c62912b';

    // Permanently hide placeholder elements that block the live video feed
    (function hidePlaceholders() {
        function _hide() {
            ['host-avatar-container','host-video-fallback-avatar','live-stream-host-avatar','agora-connecting-msg'].forEach(function(id) {
                // Don't remove connecting msg prematurely — only hide avatar placeholders
                if (id === 'agora-connecting-msg') return;
                var el = document.getElementById(id);
                if (el) { el.style.cssText += ';display:none!important;visibility:hidden!important;'; }
            });
        }
        // Run on load + after any live modal opens
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', _hide);
        } else {
            _hide();
        }
        // MutationObserver: hide whenever live modal becomes visible
        var _obs = new MutationObserver(function(muts) {
            muts.forEach(function(m) {
                if (m.target && m.target.id === 'go-live-modal-overlay') _hide();
            });
        });
        document.addEventListener('DOMContentLoaded', function() {
            var modal = document.getElementById('go-live-modal-overlay');
            if (modal) _obs.observe(modal, { attributes: true, attributeFilter: ['style','class'] });
        });
    })();

    // ── State ──────────────────────────────────────────────────────
    let agoraClient       = null;
    let agoraLocalTracks  = { audio: null, video: null };
    let agoraJoined       = false;
    let agoraViewerClient = null;
    let agoraViewerJoined = false;
    let agoraViewerTracks = [];

    // ── Helpers ────────────────────────────────────────────────────
    function _agoraLog(msg)  { console.log('[Agora]', msg); }
    function _agoraWarn(msg) { console.warn('[Agora]', msg); }

    function _safeUid(userState) {
        // Agora UIDs must be unsigned 32-bit integers
        if (userState && userState.id) {
            const h = Array.from(String(userState.id)).reduce((a,c) => ((a<<5)-a)+c.charCodeAt(0), 0);
            return Math.abs(h) % 999999 || Math.floor(Math.random()*900000+100000);
        }
        return Math.floor(Math.random() * 900000 + 100000);
    }

    function _ensureGuestContainer() {
        let gc = document.getElementById('multi-guest-container');
        if (!gc) {
            gc = document.createElement('div');
            gc.id = 'multi-guest-container';
            gc.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;padding:8px;';
            const liveFooter = document.querySelector('.live-footer, #host-control-panel');
            if (liveFooter) liveFooter.parentElement.insertBefore(gc, liveFooter);
        }
        return gc;
    }

    function _updateViewerCount(delta) {
        ['live-viewer-count','modal-viewer-count'].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) {
                const cur = parseInt(el.textContent.replace(/,/g,'')) || 1;
                el.textContent = Math.max(1, cur + delta).toLocaleString();
            }
        });
    }

    // ── HOST: Go Live ──────────────────────────────────────────────
    async function initAgoraHost(channelName, uid) {
        if (!window._agoraAvailable) {
            _agoraWarn('SDK not loaded — camera-only local preview (no remote viewers)');
            return false;
        }
        // Clean up any previous session
        await stopAgoraHost();
        try {
            agoraClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
            await agoraClient.setClientRole('host');

            // Token: use null for all dynamic channels in testing mode.
            // Agora developer/testing mode accepts null token for any channel name.
            // Replace with a Firebase Cloud Function token generator for production.
            const agoraToken = null;
            await agoraClient.join(AGORA_APP_ID, channelName, agoraToken, uid);
            agoraJoined = true;
            _agoraLog('Host joined channel: ' + channelName + ' uid:' + uid);

            // Create tracks — try HD first, fall back to SD, then audio-only
            let micTrack = null, cameraTrack = null;
            try {
                [micTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
                    { AEC: true, ANS: true, AGC: true },
                    { facingMode: 'user', encoderConfig: { width: 640, height: 480, frameRate: 24, bitrateMin: 400, bitrateMax: 1000 } }
                );
            } catch(trackErr) {
                _agoraWarn('HD camera failed, trying basic: ' + trackErr.message);
                try {
                    [micTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
                } catch(e2) {
                    _agoraWarn('Camera failed, audio-only: ' + e2.message);
                    try { micTrack = await AgoraRTC.createMicrophoneAudioTrack(); } catch(e3) {}
                }
            }

            // Publish whatever tracks we got
            const tracksToPublish = [micTrack, cameraTrack].filter(Boolean);
            if (tracksToPublish.length > 0) {
                agoraLocalTracks.audio = micTrack;
                agoraLocalTracks.video = cameraTrack;
                await agoraClient.publish(tracksToPublish);
                _agoraLog('Published ' + tracksToPublish.length + ' track(s)');
            }

            // Play local video preview
            if (cameraTrack) {
                const hostVideo = document.getElementById('host-main-video');
                if (hostVideo) {
                    // Remove old agora wrapper if any
                    const old = document.getElementById('agora-local-video');
                    if (old) old.remove();
                    const wrapper = document.createElement('div');
                    wrapper.id = 'agora-local-video';
                    wrapper.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:3;border-radius:inherit;overflow:hidden;';
                    hostVideo.parentElement.appendChild(wrapper);
                    cameraTrack.play('agora-local-video');
                    hostVideo.style.display = 'none';
                }
                // Hide fallback avatar and static avatar container
                var fa = document.getElementById('host-video-fallback-avatar');
                if (fa) fa.style.display = 'none';
                var ac2 = document.getElementById('host-avatar-container');
                if (ac2) ac2.style.display = 'none';
            }

            // ── Listen for remote viewers / co-hosts joining ──────
            agoraClient.on('user-published', async function(remoteUser, mediaType) {
                try {
                    await agoraClient.subscribe(remoteUser, mediaType);
                    _updateViewerCount(1);
                    if (mediaType === 'video') {
                        const gc = _ensureGuestContainer();
                        let gDiv = document.getElementById('agora-guest-' + remoteUser.uid);
                        if (!gDiv) {
                            gDiv = document.createElement('div');
                            gDiv.id = 'agora-guest-' + remoteUser.uid;
                            gDiv.style.cssText = 'width:160px;height:200px;border-radius:14px;overflow:hidden;background:#111;flex-shrink:0;position:relative;border:2px solid rgba(245,197,24,0.4);';
                            gDiv.innerHTML = '<div style="position:absolute;bottom:4px;left:6px;font-size:0.65rem;color:#fff;font-weight:700;background:rgba(0,0,0,0.5);padding:2px 6px;border-radius:6px;">Viewer</div>';
                            gc.appendChild(gDiv);
                        }
                        remoteUser.videoTrack.play('agora-guest-' + remoteUser.uid);
                    }
                    if (mediaType === 'audio' && remoteUser.audioTrack) {
                        remoteUser.audioTrack.play();
                    }
                } catch(subErr) { _agoraWarn('Subscribe error: ' + subErr.message); }
            });

            agoraClient.on('user-unpublished', function(remoteUser) {
                const gDiv = document.getElementById('agora-guest-' + remoteUser.uid);
                if (gDiv) { gDiv.remove(); _updateViewerCount(-1); }
            });

            agoraClient.on('user-left', function(remoteUser) {
                const gDiv = document.getElementById('agora-guest-' + remoteUser.uid);
                if (gDiv) { gDiv.remove(); _updateViewerCount(-1); }
            });

            agoraClient.on('connection-state-change', function(cur, prev) {
                _agoraLog('Connection: ' + prev + ' → ' + cur);
            });

            // Store channel name for viewers to join
            window._agoraActiveChannel = channelName;
            window._agoraActiveUid     = uid;

            if (typeof window.showNotification === 'function') {
                const mode = cameraTrack ? '📹 Video' : '🎤 Audio-only';
                window.showNotification('🔴 LIVE via Agora! ' + mode + ' — viewers worldwide can now join.', 'success');
            }

            // Publish stream presence to Firestore so other devices can join
            if (typeof window.publishLiveStreamToFirestore === 'function' && window.liveStreamData) {
                window.liveStreamData._agoraChannel = channelName;
                await window.publishLiveStreamToFirestore(window.liveStreamData);
            }

            return true;

        } catch(err) {
            _agoraWarn('Host init error: ' + err.message);
            agoraJoined = false;
            // Fall back to browser camera preview
            if (typeof window.showNotification === 'function') {
                window.showNotification('⚠️ Agora connection failed — stream visible on this device only. Check internet.', 'warning');
            }
            // Even without Agora, publish stream info so others can see we're live
            if (typeof window.publishLiveStreamToFirestore === 'function' && window.liveStreamData) {
                window.liveStreamData._agoraChannel = channelName;
                window.publishLiveStreamToFirestore(window.liveStreamData);
            }
            return false;
        }
    }

    // ── HOST: End Stream ──────────────────────────────────────────
    async function stopAgoraHost() {
        try {
            if (agoraLocalTracks.audio) { agoraLocalTracks.audio.stop(); agoraLocalTracks.audio.close(); agoraLocalTracks.audio = null; }
            if (agoraLocalTracks.video) { agoraLocalTracks.video.stop(); agoraLocalTracks.video.close(); agoraLocalTracks.video = null; }
            if (agoraClient && agoraJoined) { await agoraClient.leave(); }
            agoraJoined = false;
            agoraClient = null;
            // Remove from Firestore so other devices know stream ended
            if (typeof window.unpublishLiveStreamFromFirestore === 'function' && window.liveStreamData && window.liveStreamData.streamId) {
                window.unpublishLiveStreamFromFirestore(window.liveStreamData.streamId);
            }
            window._agoraActiveChannel = null;
            // Restore native video element
            const agoraDiv = document.getElementById('agora-local-video');
            if (agoraDiv) agoraDiv.remove();
            const hostVideo = document.getElementById('host-main-video');
            if (hostVideo) hostVideo.style.display = '';
            _agoraLog('Host session ended cleanly');
        } catch(e) { _agoraWarn('Stop host error: ' + e.message); }
    }

    // ── VIEWER: Join a live stream ────────────────────────────────
    async function initAgoraViewer(channelName,uid){
        if(!window._agoraAvailable){
            _agoraWarn('Agora SDK not loaded — viewer cannot connect to real stream');
            var _cm2=document.getElementById('agora-connecting-msg');
            if(_cm2)_cm2.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:white;text-align:center;padding:20px;"><span style="font-size:2rem;">📡</span><span style="font-size:0.9rem;opacity:0.85;">Live video requires the Agora SDK.<br>Check your connection and reload.</span></div>';
            var _hfa=document.getElementById('host-video-fallback-avatar');if(_hfa)_hfa.style.display='block';
            return false;
        }
        await stopAgoraViewer();
        try {
            agoraViewerClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
            await agoraViewerClient.setClientRole('audience');
            // Null token for testing mode — same as host
            const agoraViewerToken = null;
            await agoraViewerClient.join(AGORA_APP_ID, channelName, agoraViewerToken, uid);
            agoraViewerJoined = true;
            _agoraLog('Viewer joined channel: ' + channelName);

            // Receive host video/audio
            agoraViewerClient.on('user-published', async function(remoteUser, mediaType) {
                try {
                    await agoraViewerClient.subscribe(remoteUser, mediaType);
                    if (mediaType === 'video') {
                        // Play host stream in the main view area
                        const hostVideo = document.getElementById('host-main-video');
                        let viewerWrapper = document.getElementById('agora-viewer-video');
                        if (!viewerWrapper) {
                            viewerWrapper = document.createElement('div');
                            viewerWrapper.id = 'agora-viewer-video';
                            viewerWrapper.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:3;border-radius:inherit;overflow:hidden;background:#000;';
                            if (hostVideo && hostVideo.parentElement) {
                                hostVideo.parentElement.appendChild(viewerWrapper);
                                hostVideo.style.display = 'none';
                            }
                        }
                        remoteUser.videoTrack.play('agora-viewer-video');
                        _agoraLog('Viewer: host video stream playing');
                        // Remove connecting spinner and hide avatar overlay
                        var cm = document.getElementById('agora-connecting-msg');
                        if (cm) cm.remove();
                        var ac = document.getElementById('host-avatar-container');
                        if (ac) ac.style.display = 'none';
                        // Remove the fallback avatar image too
                        var fa = document.getElementById('host-video-fallback-avatar');
                        if (fa) fa.style.display = 'none';
                    }
                    if (mediaType === 'audio' && remoteUser.audioTrack) {
                        remoteUser.audioTrack.play();
                        _agoraLog('Viewer: host audio playing');
                    }
                } catch(subErr) { _agoraWarn('Viewer subscribe error: ' + subErr.message); }
            });

            agoraViewerClient.on('user-unpublished', function(remoteUser, mediaType) {
                if (mediaType === 'video') {
                    const vw = document.getElementById('agora-viewer-video');
                    if (vw) vw.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:white;font-size:1rem;">Stream paused</div>';
                }
            });

            agoraViewerClient.on('user-left', function() {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('📴 The host has ended the live stream.', 'info');
                }
                stopAgoraViewer();
            });

            if (typeof window.showNotification === 'function') {
                window.showNotification('✅ Connected to live stream!', 'success');
            }
            return true;
        } catch(err) {
            _agoraWarn('Viewer join error: ' + err.message);
            agoraViewerJoined = false;
            return false;
        }
    }

    async function stopAgoraViewer() {
        try {
            agoraViewerTracks.forEach(function(t) { try { t.stop(); t.close(); } catch(e){} });
            agoraViewerTracks = [];
            if (agoraViewerClient && agoraViewerJoined) { await agoraViewerClient.leave(); }
            agoraViewerJoined = false;
            agoraViewerClient = null;
            const vw = document.getElementById('agora-viewer-video');
            if (vw) vw.remove();
            const hostVideo = document.getElementById('host-main-video');
            if (hostVideo) hostVideo.style.display = '';
            _agoraLog('Viewer session ended');
        } catch(e) { _agoraWarn('Stop viewer error: ' + e.message); }
    }

    // ── HOOK: Go Live form submit → launch Agora host ──────────────
    // IMPORTANT: Agora runs AFTER local camera (getUserMedia) has started.
    // Local camera starts at t=400ms (in go-live-form case handler).
    // Agora joins at t=1800ms so local preview is never blocked.
    // If Agora fails, the local camera stream continues working perfectly.
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (!form || form.id !== 'go-live-form') return;
        setTimeout(async function() {
            if (!window.liveStreamData || !window.liveStreamData.isLive) return;

            // Derive a stable channel name from the streamId
            const streamId    = window.liveStreamData.streamId;
            const channelName = 'empyrean-' + streamId;
            const uid         = _safeUid(window.userState);

            window.liveStreamData._agoraChannel = channelName;
            window.liveStreamData._agoraUid     = uid;

            // STEP 1: Join Agora first (or start local camera-only mode)
            let agoraOk = false;
            if (window._agoraAvailable) {
                try {
                    _agoraLog('Host joining Agora channel: ' + channelName);
                    agoraOk = await initAgoraHost(channelName, uid);
                } catch(err) {
                    _agoraWarn('Agora failed (' + err.message + ') — continuing in local mode');
                }
            } else {
                _agoraWarn('Agora SDK not loaded — local camera-only mode');
            }

            // STEP 2: AFTER Agora confirms (or fails), write isLive:true to Firestore
            // This matches the reference pattern: Firestore is updated only once
            // the host is confirmed live, so viewers always join a real stream.
            if (typeof window.publishLiveStreamToFirestore === 'function') {
                await window.publishLiveStreamToFirestore(window.liveStreamData);
                _agoraLog('Firestore updated — other devices will now see the stream');
            }

            if (!agoraOk) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('📡 Live (local mode) — Agora unavailable. Your stream is published.', 'info');
                }
            }
        }, 1200);
    }, true);

    // ── HOOK: Viewer clicks "Join" card → Agora audience join ─────
    document.addEventListener('click', function(e) {
        const joinBtn = e.target.closest && e.target.closest('.join-live-btn');
        if (!joinBtn) return;
        setTimeout(async function() {
            if (!window._agoraAvailable) return;
            try {
                // Prefer the channel stored on the card (from Firestore doc)
                const channelName = joinBtn.dataset.agoraChannel
                    || window._agoraActiveChannel
                    || ('empyrean-' + (joinBtn.dataset.streamId || 'live'));
                window._agoraActiveChannel = channelName; // store for mic/video controls
                const uid = _safeUid(window.userState);
                _agoraLog('Viewer joining channel: ' + channelName);
                await initAgoraViewer(channelName, uid);
            } catch(vErr) {
                _agoraWarn('Viewer Agora connect failed: ' + vErr.message);
            }
        }, 800);
    });

    // ── HOOK: End stream / close live modal ───────────────────────
    document.addEventListener('click', function(e) {
        if (!e.target.closest) return;
        if (e.target.closest('#live-close-btn')) {
            stopAgoraHost();
            stopAgoraViewer();
            // Stop all media tracks safely
            document.querySelectorAll('video').forEach(function(v) {
                try { if (v.srcObject) { v.srcObject.getTracks().forEach(function(t) { t.stop(); }); v.srcObject = null; } } catch(er) {}
            });
            // Re-hide avatar container and reset elements for next session
            var ac3 = document.getElementById('host-avatar-container');
            if (ac3) ac3.style.display = 'none';
            var hv = document.getElementById('host-main-video');
            if (hv) {
                try { if (hv.srcObject) { hv.srcObject.getTracks().forEach(function(t) { t.stop(); }); hv.srcObject = null; } } catch(e) {}
                hv.src = ''; hv.style.display = 'none';
            }
            ['agora-connecting-msg', 'agora-viewer-video', 'agora-local-video'].forEach(function(id) {
                var el = document.getElementById(id); if (el) el.remove();
            });
            // FIX Bug 8: use BOTH style AND classList to guarantee modal closes
            var goLiveOverlay = document.getElementById('go-live-modal-overlay');
            if (goLiveOverlay) {
                goLiveOverlay.classList.remove('show');
                goLiveOverlay.style.display = 'none';
                goLiveOverlay.style.visibility = 'hidden';
            }
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            // Reset live state so user can go live again
            if(window.liveStreamData){
                window.liveStreamData.isLive=false;
                // Keep streamId so host can rejoin — only clear after confirmed permanent end
                window.liveStreamData._localStream=null;
                window.liveStreamData._agoraChannel=null;
                if (window.liveStreamData.rewardInterval) { clearInterval(window.liveStreamData.rewardInterval); window.liveStreamData.rewardInterval = null; }
                if (window.liveStreamData._viewerSimInterval) { clearInterval(window.liveStreamData._viewerSimInterval); window.liveStreamData._viewerSimInterval = null; }
            }
            window._agoraActiveChannel = null;
        }
    });

    // ── HOOK: Mic toggle sync ─────────────────────────────────────
    document.addEventListener('click', function(e) {
        if (!e.target.closest) return;
        if (e.target.closest('#live-mic-toggle') && agoraLocalTracks.audio && agoraJoined) {
            const muted = window.liveStreamData && window.liveStreamData.isMicMuted;
            agoraLocalTracks.audio.setMuted(!!muted);
        }
        if (e.target.closest('#live-video-toggle') && agoraLocalTracks.video && agoraJoined) {
            const muted = window.liveStreamData && window.liveStreamData.isVideoMuted;
            agoraLocalTracks.video.setMuted(!!muted);
        }
    });

    // ── Expose to window for debugging ───────────────────────────
    window._agora = {
        appId: AGORA_APP_ID,
        initHost: initAgoraHost,
        stopHost: stopAgoraHost,
        initViewer: initAgoraViewer,
        stopViewer: stopAgoraViewer,
        getChannel: function() { return window._agoraActiveChannel; },
        status: function() { return { hostJoined: agoraJoined, viewerJoined: agoraViewerJoined, sdkLoaded: !!window._agoraAvailable }; }
    };

    /* ═══════════════════════════════════════════════════════════════
       REAL-TIME LIVE STREAM BROADCASTING
       When a host goes live, ALL other logged-in devices see it
       immediately via Firestore real-time listener.
    ═══════════════════════════════════════════════════════════════ */
    (function() {
        var _streamListener   = null;
        var _knownStreamIds   = {};

        // Host writes their stream to Firestore when going live
        window.publishLiveStreamToFirestore = async function(streamData) {
            // CRITICAL: Must use real Firestore, not the stub
            // The stub's set() is a no-op — other devices will never see the stream
            if (!window._firebaseLoaded) {
                _agoraLog('[Live] Firebase not ready — waiting before publishing stream...');
                await new Promise(function(resolve) {
                    var tries = 0;
                    var t = setInterval(function() {
                        tries++;
                        if (window._firebaseLoaded || tries > 30) { clearInterval(t); resolve(); }
                    }, 500);
                });
            }
            var db = window.fbDb;
            if (!db || !window._firebaseLoaded) {
                _agoraWarn('[Live] Real Firestore unavailable — stream will only be visible locally');
                return;
            }
            try {
                var channel = streamData._agoraChannel || ('empyrean-' + (streamData.streamId || Date.now()));
                var hostId = streamData.hostUserId || (window.userState && window.userState.id) || 'unknown';
                var hostName = (window.userState && window.userState.fullName) || 'Unknown Host';
                var hostAvatar = (window.userState && window.userState.avatar) || '';
                var docData = {
                    streamId:   streamData.streamId,
                    hostId:     hostId,
                    hostName:   hostName,
                    hostAvatar: hostAvatar,
                    title:      streamData.title || 'Live Stream',
                    background: streamData.background || '',
                    channel:    channel,
                    startedAt:  new Date().toISOString(),
                    isLive:     true
                };
                // Write main doc by streamId
                await db.collection('active_streams').doc(docData.streamId).set(docData);
                // ALSO write to a stable "current_live_{hostId}" doc
                // so any device can always find the host's active stream without index
                var stableDocId = 'host_' + hostId.replace(/[^a-zA-Z0-9]/g, '_');
                try {
                    await db.collection('active_streams').doc(stableDocId).set(docData);
                } catch(e2) {}
                window._agoraActiveChannel = channel;
                _agoraLog('[Live] ✅ Stream published — DocId: ' + docData.streamId + ' | StableId: ' + stableDocId + ' | Channel: ' + channel + ' | Host: ' + hostName);
                console.log('[Live] Firestore write confirmed. Other devices WILL see this stream.');
                // Notify via notifications collection
                try {
                    await db.collection('notifications').add({
                        type: 'live',
                        message: '🔴 ' + hostName + ' is now LIVE! Tap to join.',
                        hostId: hostId, hostName: hostName,
                        streamId: docData.streamId, channel: channel,
                        createdAt: new Date().toISOString(), read: false
                    });
                } catch(ne) {}
            } catch(e) {
                _agoraWarn('[Live] Publish failed: ' + e.message);
                // Retry once after 3s
                setTimeout(function() { window.publishLiveStreamToFirestore(streamData); }, 3000);
            }
        };

        // Host removes their stream from Firestore when ending
        window.unpublishLiveStreamFromFirestore = async function(streamId) {
            var db = window.fbDb;
            if (!db || !streamId) return;
            try {
                await db.collection('active_streams').doc(streamId).update({
                    isLive: false, endedAt: new Date().toISOString()
                });
            } catch(e) {
                try { await db.collection('active_streams').doc(streamId).delete(); } catch(e2) {}
            }
        };

        // ── Helper: build and insert one join card ──────────────────
        function _insertStreamCard(s, slider) {
            var sid = s.streamId;
            if (!slider) return;
            // Remove duplicate if exists (may have been inserted by createDashboardLiveCard)
            var existing = slider.querySelector('.join-live-btn[data-stream-id="'+sid+'"]');
            if (existing) {
                // Update the agoraChannel data in case it wasn't set before
                if (s.channel && !existing.dataset.agoraChannel) {
                    existing.dataset.agoraChannel = s.channel;
                }
                return; // card already there
            }
            // Hide the "no live streams" empty placeholder
            var emptyEl = document.getElementById('live-slider-empty');
            if (emptyEl) emptyEl.style.display = 'none';

            var card = document.createElement('div');
            card.className = 'live-stream-preview-card join-live-btn';
            card.dataset.streamId     = sid;
            card.dataset.hostId       = s.hostId || '';
            card.dataset.hostName     = s.hostName || 'Host';
            card.dataset.hostAvatar   = s.hostAvatar || '';
            card.dataset.streamTitle  = s.title || 'Live Stream';
            card.dataset.background   = s.background || '';
            card.dataset.agoraChannel = s.channel || ('empyrean-' + sid);

            var bg = s.background || 'linear-gradient(160deg,#0A0E27,#1B2B8B)';
            if (bg.startsWith('http') || bg.startsWith('blob:') || bg.startsWith('url(')) {
                card.style.backgroundImage  = bg.startsWith('url(') ? bg : 'url(' + bg + ')';
                card.style.backgroundSize   = 'cover';
                card.style.backgroundPosition = 'center';
            } else { card.style.background = bg; }

            card.style.cssText += ';flex:0 0 180px;height:200px;border-radius:16px;overflow:hidden;position:relative;cursor:pointer;';

            card.innerHTML =
                '<div class="live-preview-header" style="position:absolute;top:10px;left:10px;right:10px;z-index:2;">' +
                    '<span class="live-tag" style="background:rgba(239,68,68,0.9);color:white;padding:3px 10px;border-radius:50px;font-size:0.7rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;">' +
                        '<i class="fas fa-circle" style="font-size:0.5rem;animation:fa-beat 1s infinite;"></i> LIVE' +
                    '</span>' +
                '</div>' +
                '<div style="position:absolute;inset:0;background:linear-gradient(transparent 40%,rgba(0,0,0,0.85));z-index:1;"></div>' +
                '<div class="live-preview-footer" style="position:absolute;bottom:0;left:0;right:0;padding:12px;z-index:2;display:flex;align-items:center;gap:8px;">' +
                    '<img src="' + (s.hostAvatar||'') + '" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid white;flex-shrink:0;" >' +
                    '<div style="flex:1;min-width:0;">' +
                        '<strong style="display:block;font-size:0.82rem;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (s.hostName||'Host') + '</strong>' +
                        '<span style="font-size:0.7rem;color:rgba(255,255,255,0.75);">' + (s.title||'Tap to join') + '</span>' +
                    '</div>' +
                '</div>' +
                '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2;background:rgba(239,68,68,0.85);color:white;padding:8px 16px;border-radius:50px;font-size:0.78rem;font-weight:700;pointer-events:none;">▶ Join Live</div>';

            slider.prepend(card);
            _knownStreamIds[sid] = true;
        }

        // All devices subscribe to active_streams in real time
        window.startLiveStreamListener = function() {
            var db = window.fbDb;
            if (!db) { setTimeout(window.startLiveStreamListener, 2000); return; }

            // Guard: only attach to real Firestore, not the stub
            // The stub's onSnapshot fires once with empty data and never again
            if (!window._firebaseLoaded) {
                // Not ready yet — poll until real Firebase is available
                var _liveTimer = setInterval(function() {
                    if (window._firebaseLoaded) {
                        clearInterval(_liveTimer);
                        window.startLiveStreamListener();
                    }
                }, 800);
                setTimeout(function() { clearInterval(_liveTimer); }, 30000);
                return;
            }

            if (_streamListener) { try { _streamListener(); } catch(e) {} _streamListener = null; }

            // ── Full scan on attach: no where() clause = no index needed ──
            // Filter client-side for isLive docs
            db.collection('active_streams')
                .orderBy('startedAt', 'desc')
                .limit(20)
                .get()
                .then(function(snap) {
                    if (!snap || snap.empty) return;
                    var slider = document.getElementById('dashboard-live-slider');
                    snap.forEach(function(doc) {
                        var s = doc.data();
                        if (s && s.isLive === true) _insertStreamCard(s, slider);
                    });
                })
                .catch(function(e) {
                    // Fallback: scan without orderBy if no index
                    db.collection('active_streams').get()
                        .then(function(snap2) {
                            if (!snap2 || snap2.empty) return;
                            var slider = document.getElementById('dashboard-live-slider');
                            snap2.forEach(function(doc) {
                                var s = doc.data();
                                if (s && s.isLive === true) _insertStreamCard(s, slider);
                            });
                        }).catch(function(){});
                });

            // Real-time listener: no where() = no index required
            // Client-side filter handles isLive check
            _streamListener = db.collection('active_streams')
                .onSnapshot(function(snapshot) {
                    if (!snapshot) return;
                    snapshot.docChanges().forEach(function(change) {
                        var s     = change.doc.data();
                        if (!s || !s.streamId) return; // skip malformed docs
                        var sid   = s.streamId;
                        var myId  = window.userState && window.userState.id;
                        var isMe  = myId && myId === s.hostId;

                        // Client-side isLive filter (replaces where() query that needs index)
                        if (change.type === 'added' || change.type === 'modified') {
                            if (!s.isLive) {
                                // Stream ended — remove card
                                var endedCard = document.querySelector('.join-live-btn[data-stream-id="'+sid+'"]');
                                if (endedCard) { endedCard.style.opacity='0'; setTimeout(function(){endedCard.remove();},300); }
                                delete _knownStreamIds[sid];
                                delete _knownStreamIds[sid+'-notified'];
                                return;
                            }
                        }

                        if (change.type === 'added' || (change.type === 'modified' && s.isLive)) {
                            var slider = document.getElementById('dashboard-live-slider');
                            _insertStreamCard(s, slider);

                            // Show join banner on other devices
                            if (!isMe && !_knownStreamIds[sid + '-notified']) {
                                _knownStreamIds[sid + '-notified'] = true;
                                if(typeof window.pushNotification==='function'){
                                    window.pushNotification('🔴 '+s.hostName+' is LIVE! Tap to join.','live',null,
                                        {channelName:s.channelName||s.streamId||sid,streamId:sid,hostName:s.hostName||''});
                                }
                                // Red banner at top with Join Now button
                                var oldBanner = document.getElementById('live-join-banner');
                                if (oldBanner) oldBanner.remove();
                                var banner = document.createElement('div');
                                banner.id = 'live-join-banner';
                                banner.style.cssText = 'position:fixed;top:70px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#EF4444,#DC2626);color:white;padding:12px 20px;border-radius:16px;box-shadow:0 8px 30px rgba(239,68,68,0.4);z-index:9999;display:flex;align-items:center;gap:12px;max-width:340px;width:90%;';
                                var joinBtn = document.createElement('button');
                                joinBtn.style.cssText = 'background:white;color:#DC2626;border:none;border-radius:10px;padding:8px 14px;font-size:0.82rem;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;';
                                joinBtn.textContent = 'Join Now';
                                joinBtn.onclick = function() {
                                    banner.remove();
                                    var card = document.querySelector('.join-live-btn[data-stream-id="' + sid + '"]');
                                    if (card) card.click();
                                };
                                var dismissBtn = document.createElement('button');
                                dismissBtn.style.cssText = 'background:rgba(255,255,255,0.25);border:none;color:white;border-radius:50%;width:26px;height:26px;cursor:pointer;flex-shrink:0;font-size:1rem;';
                                dismissBtn.innerHTML = '&times;';
                                dismissBtn.onclick = function() { banner.remove(); };
                                var info = document.createElement('div');
                                info.style.cssText = 'flex:1;min-width:0;';
                                info.innerHTML = '<strong style="display:block;font-size:0.88rem;">' + (s.hostName||'Host') + ' is LIVE!</strong><span style="font-size:0.75rem;opacity:0.85;">' + (s.title||'') + '</span>';
                                banner.appendChild(document.createElement('i')).className = 'fas fa-circle';
                                banner.appendChild(info);
                                banner.appendChild(joinBtn);
                                banner.appendChild(dismissBtn);
                                if (!document.getElementById('live-slide-anim')) {
                                    var st = document.createElement('style');
                                    st.id = 'live-slide-anim';
                                    st.textContent = '@keyframes liveSlideDown{from{opacity:0;top:50px}to{opacity:1;top:70px}}#live-join-banner{animation:liveSlideDown .3s ease;}';
                                    document.head.appendChild(st);
                                }
                                document.body.appendChild(banner);
                                setTimeout(function() { if (banner.parentElement) banner.remove(); }, 12000);
                            }
                        }

                        if (change.type === 'removed' || (change.type === 'modified' && !s.isLive)) {
                            // Remove card when stream ends
                            var c = document.querySelector('.join-live-btn[data-stream-id="'+sid+'"]');
                            if (c) {
                                c.style.opacity = '0';
                                c.style.transition = 'opacity .4s';
                                setTimeout(function() {
                                    c.remove();
                                    // Show empty state if no other live cards remain
                                    var slider2 = document.getElementById('dashboard-live-slider');
                                    if (slider2 && !slider2.querySelector('.join-live-btn')) {
                                        var emptyEl2 = document.getElementById('live-slider-empty');
                                        if (emptyEl2) emptyEl2.style.display = '';
                                    }
                                }, 400);
                            }
                            delete _knownStreamIds[sid];
                            delete _knownStreamIds[sid+'-notified'];
                            var ld = window.liveStreamData;
                            if (ld && ld.streamId === sid && !isMe && typeof window.showNotification === 'function') {
                                window.showNotification('📴 This live stream has ended.', 'info');
                            }
                        }
                    });
                }, function(err) {
                    console.warn('[Live] Listener error:', err.message);
                    setTimeout(window.startLiveStreamListener, 10000);
                });
            console.log('[Live] Real-time stream listener active');
        };

        // Expose viewer join helper
        window.joinLiveAsViewer=function(channel,hostName){
            if(channel)window._agoraActiveChannel=channel;
            // If this is the host rejoining their own stream
            if(window.liveStreamData&&window.liveStreamData.streamId===channel&&!window.liveStreamData.isLive){
                var _lo=document.getElementById('go-live-modal-overlay');
                if(_lo){_lo.style.display='flex';_lo.classList.add('show');document.body.classList.add('modal-open');}
                if(typeof initAgoraHost==='function')initAgoraHost(channel).catch(function(e){console.warn('[Rejoin]',e);});
            }
        };

        // Auto-start listener — FIX Bug 1: start for ALL users including guests
        // so live streams are globally visible without requiring login
        (function() {
            function _tryStartLiveListener() {
                if (window._firebaseLoaded) {
                    window.startLiveStreamListener();
                } else {
                    var _t = setInterval(function() {
                        if (window._firebaseLoaded) {
                            clearInterval(_t);
                            window.startLiveStreamListener();
                        }
                    }, 600);
                    setTimeout(function() { clearInterval(_t); }, 30000);
                }
            }
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', _tryStartLiveListener);
            } else {
                _tryStartLiveListener();
            }
        })();

        document.addEventListener('empyrean-init-done', function() {
            // Restart listener after login — real Firebase is guaranteed ready here
            if (_streamListener) { try { _streamListener(); } catch(e) {} _streamListener = null; }
            window._postsListener = null;
            window._newsListener = null;
            window._mktListener = null;
            setTimeout(window.startLiveStreamListener, 500);
            // Also restart post/news/mkt listeners
            if (typeof window._startRealtimeListeners === 'function') {
                setTimeout(window._startRealtimeListeners, 600);
            }
        });

    })();

    /* ─────────────────────────────────────────────
       PART 6 — STATUS MEDIA UPLOAD FIX
    ───────────────────────────────────────────── */
    document.addEventListener('change', function(e) {
        const statusInput = e.target.closest('#status-media-input, [id*="status"][id*="input"]');
        if (!statusInput) return;
        const files = Array.from(statusInput.files || []);
        if (!files.length) return;
        window._statusMediaFiles = files;
        const preview = document.getElementById('status-media-preview') || document.querySelector('.status-media-preview');
        if (preview) {
            preview.innerHTML = '';
            files.forEach(function(f) {
                const url = URL.createObjectURL(f);
                const d = document.createElement('div');
                d.style.cssText = 'display:inline-block;margin:4px;border-radius:8px;overflow:hidden;';
                d.innerHTML = f.type.startsWith('video/')
                    ? '<video src="' + url + '" style="width:80px;height:80px;object-fit:cover;" muted></video>'
                    : '<img src="' + url + '" style="width:80px;height:80px;object-fit:cover;">';
                preview.appendChild(d);
            });
        }
    });

    /* ─────────────────────────────────────────────
       PART 7 — COMMUNITY REPORT MEDIA UPLOAD FIX
    ───────────────────────────────────────────── */
    document.addEventListener('change', function(e) {
        const crisisInput = e.target.closest('#crisis-media-input');
        if (!crisisInput) return;
        const files = Array.from(crisisInput.files || []);
        window.crisisMediaFiles = files;
        const preview = document.getElementById('crisis-media-preview');
        if (!preview) return;
        preview.innerHTML = '';
        files.forEach(function(f) {
            const url = URL.createObjectURL(f);
            const d = document.createElement('div');
            d.style.cssText = 'display:inline-block;margin:4px;border-radius:8px;overflow:hidden;';
            d.innerHTML = f.type.startsWith('video/')
                ? '<video src="' + url + '" style="width:80px;height:80px;object-fit:cover;" muted></video>'
                : '<img src="' + url + '" style="width:80px;height:80px;object-fit:cover;">';
            preview.appendChild(d);
        });
    });

    /* ─────────────────────────────────────────────
       PART 8 — PROFILE DASHBOARD LIVE SYNC
       Mirror live stream cards into profile dash
    ───────────────────────────────────────────── */
    function syncProfileDashLive() {
        const mainSlider = document.getElementById('dashboard-live-slider');
        const profileSlider = document.getElementById('profile-dash-live-slider');
        if (!mainSlider || !profileSlider) return;
        profileSlider.innerHTML = mainSlider.innerHTML || '<div style="color:var(--text-muted);font-size:0.85rem;padding:20px;">No active live streams.</div>';
    }

    // Sync when navigating to profile
    document.addEventListener('click', function(e) {
        const navLink = e.target.closest('.nav-link[data-target="profile"], .mobile-nav-item[data-target="profile"]');
        if (navLink) setTimeout(syncProfileDashLive, 600);
    });

    /* ─────────────────────────────────────────────
       PART 9 — PASSWORD STRENGTH INDICATOR in Signup
    ───────────────────────────────────────────── */
    document.addEventListener('input', function(e) {
        const pwInput = e.target;
        if (!pwInput || pwInput.id !== 'signup-password') return;
        const val = pwInput.value;
        let strength = 0;
        if (val.length >= 8) strength++;
        if (/[A-Z]/.test(val)) strength++;
        if (/[a-z]/.test(val)) strength++;
        if (/[0-9]/.test(val)) strength++;
        if (/[^A-Za-z0-9]/.test(val)) strength++;

        let indicator = document.getElementById('pw-strength-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'pw-strength-indicator';
            indicator.style.cssText = 'margin-top:6px;height:4px;border-radius:4px;transition:all 0.3s;';
            if (pwInput.parentNode) pwInput.parentNode.appendChild(indicator);

            const label = document.createElement('div');
            label.id = 'pw-strength-label';
            label.style.cssText = 'font-size:0.76rem;margin-top:4px;font-weight:600;';
            if (pwInput.parentNode) pwInput.parentNode.appendChild(label);
        }
        const label = document.getElementById('pw-strength-label');
        const colors = ['#ef4444','#f97316','#eab308','#22c55e','#10b981'];
        const labels = ['Very weak','Weak','Fair','Strong','Very strong'];
        const widths = ['20%','40%','60%','80%','100%'];
        if (val.length === 0) {
            indicator.style.background = 'transparent';
            indicator.style.width = '0%';
            if (label) label.textContent = '';
        } else {
            const idx = Math.max(0, strength - 1);
            indicator.style.background = colors[idx];
            indicator.style.width = widths[idx];
            if (label) { label.textContent = labels[idx]; label.style.color = colors[idx]; }
        }
    });

    /* ─────────────────────────────────────────────
       PART 10 — CLOSEST SCOPE BUG — GLOBAL PATCH
       Any secondary listener that references `closest`
       as a free variable now uses e.target.closest
    ───────────────────────────────────────────── */
    // All secondary listeners in this file already use e.target.closest() 
    // The main handler at line ~7195 defines its own local `closest` correctly.
    // Expose a window-level fallback for any stray references:
    if (typeof window.closest === 'undefined') {
        // Don't override Element.prototype.closest — just provide a safe wrapper
        window._safeClosest = function(el, selector) {
            try { return el && el.closest ? el.closest(selector) : null; } catch(e) { return null; }
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // FINAL FIX BLOCK — Runtime patches applied after all scripts load
    // ═══════════════════════════════════════════════════════════════
    (function applyFinalFixes() {

        // FIX A: Prevent initializeApp recursive wrapping
        // Guard against multiple wrappers calling each other
        if (!window._initAppGuard) {
            window._initAppGuard = true;
            const _safeInit = window.initializeApp;
            if (typeof _safeInit === 'function') {
                window.initializeApp = function guardedInit(guestMode, adminMode, userData) {
                    if (window._initAppRunning) return;
                    window._initAppRunning = true;
                    try { _safeInit.call(this, guestMode, adminMode, userData); }
                    finally { setTimeout(() => { window._initAppRunning = false; }, 100); }
                };
            }
        }

        // FIX B: Camera permission — pre-request on page load for faster go-live
        // On Android, getUserMedia MUST be triggered from a user gesture.
        // We attach a one-time permission primer to the Go Live nav click.
        var _cameraPermPrimed = false;
        document.addEventListener('click', function(e) {
            var goLiveTarget = e.target.closest && e.target.closest('[data-target="go-live"], .go-live-btn');
            if (goLiveTarget && !_cameraPermPrimed) {
                _cameraPermPrimed = true;
                // Pre-request camera in user-gesture context so the later getUserMedia is allowed
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                        .then(function(stream) {
                            // Store pre-acquired stream for immediate use when live modal opens
                            if (window.liveStreamData) window.liveStreamData._localStream = stream;
                            else window._preLiveStream = stream;
                        })
                        .catch(function(err) {
                            console.warn('[Empyrean] Camera pre-request failed:', err.name);
                        });
                }
            }
        }, true);

        // FIX C: Patch startHostCamera to use pre-acquired stream if available
        var _patchStartCamera = setInterval(function() {
            if (window.liveStreamData !== undefined) {
                clearInterval(_patchStartCamera);
                // If we pre-acquired a stream before the modal opened, attach it
                if (window._preLiveStream && !window.liveStreamData._localStream) {
                    window.liveStreamData._localStream = window._preLiveStream;
                    window._preLiveStream = null;
                }
            }
        }, 500);

        // FIX D: Mobile nav — ensure top positioning overrides any bottom CSS
        var mobileNav = document.getElementById('mobile-bottom-nav');
        if (mobileNav) {
            mobileNav.style.top = '0';
            mobileNav.style.bottom = 'auto';
            mobileNav.style.borderTop = 'none';
            mobileNav.style.borderBottom = '1px solid rgba(10,14,39,0.08)';
            mobileNav.style.boxShadow = '0 4px 20px rgba(10,14,39,0.08)';
            // Adjust main content top padding
            var mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.style.paddingBottom = '';
                mainContent.style.paddingTop = '68px';
            }
        }

        // FIX E: Public dashboard feed — ensure ALL posts appear (remove follow filter)
        // Patch createNewPostElement to always append to #feed-container regardless of author
        var _origCreatePost = window.createNewPostElement;
        if (typeof _origCreatePost === 'function' && !window._createPostPatched) {
            window._createPostPatched = true;
            // The real fix: when any post is created, also add to public feed if not already there
            var _feedObserverActive = false;
            if (!_feedObserverActive) {
                _feedObserverActive = true;
                document.addEventListener('empyrean:postCreated', function(ev) {
                    var feedContainer = document.getElementById('feed-container');
                    var emptyState = document.getElementById('feed-empty-state');
                    if (feedContainer && ev.detail && ev.detail.element) {
                        var existing = ev.detail.postId ? feedContainer.querySelector('[data-post-id="' + ev.detail.postId + '"]') : null;
                        if (!existing) {
                            feedContainer.prepend(ev.detail.element);
                            if (emptyState) emptyState.style.display = 'none';
                        }
                    }
                });
            }
        }

    })();

    console.log('[Empyrean] Comprehensive fix pack loaded ✅ — Agora:', window._agoraAvailable ? 'Active' : 'Fallback mode');

    // ═══════════════════════════════════════════════════════════
    // FINAL PATCH BLOCK — Empyrean v5.1 targeted bug fixes
    // ═══════════════════════════════════════════════════════════
    (function applyV5Patches() {

        // PATCH 1: Community Reporting (crisis-form) upload binding
        // Ensure crisisMediaFiles is always synced to window scope
        var crisisInput = document.getElementById('crisis-media-input');
        if (crisisInput && !crisisInput._v51) {
            crisisInput._v51 = true;
            crisisInput.addEventListener('change', function() {
                window.crisisMediaFiles = Array.from(this.files || []);
                var p = document.getElementById('crisis-media-preview');
                if (!p) return;
                p.innerHTML = '';
                window.crisisMediaFiles.forEach(function(f) {
                    var url = URL.createObjectURL(f);
                    var d = document.createElement('div');
                    d.style.cssText = 'display:inline-block;margin:4px;border-radius:8px;overflow:hidden;';
                    d.innerHTML = f.type.startsWith('video/')
                        ? '<video src="' + url + '" style="width:80px;height:80px;object-fit:cover;" muted playsinline></video>'
                        : '<img src="' + url + '" style="width:80px;height:80px;object-fit:cover;">';
                    p.appendChild(d);
                });
            });
        }

        // PATCH 2: SOS upload binding — ensure window.sosMediaFiles always current
        var sosInput = document.getElementById('sos-media-input');
        if (sosInput && !sosInput._v51) {
            sosInput._v51 = true;
            sosInput.addEventListener('change', function() {
                window.sosMediaFiles = Array.from(this.files || []);
                var p = document.getElementById('sos-media-preview');
                if (!p) return;
                p.innerHTML = '';
                window.sosMediaFiles.forEach(function(f) {
                    var url = URL.createObjectURL(f);
                    var d = document.createElement('div');
                    d.style.cssText = 'display:inline-block;margin:4px;border-radius:8px;overflow:hidden;';
                    d.innerHTML = f.type.startsWith('video/')
                        ? '<video src="' + url + '" style="width:80px;height:80px;object-fit:cover;" muted playsinline></video>'
                        : '<img src="' + url + '" style="width:80px;height:80px;object-fit:cover;">';
                    p.appendChild(d);
                });
            });
        }

        // PATCH 3: Status bar — force visible after any status post
        // Intercept renderStatusBar to always keep bar visible
        var _origRSB = window.renderStatusBar;
        if (_origRSB && !window._rsb_patched) {
            window._rsb_patched = true;
            window.renderStatusBar = function() {
                _origRSB.apply(this, arguments);
                var sbc = document.getElementById('status-bar-container');
                if (sbc) { sbc.classList.add('visible'); sbc.style.display = 'block'; }
            };
        }

        // PATCH 4: Reel upload — ensure reel-video-file is never blocked by browser native validation
        var reelForm = document.getElementById('reel-upload-form');
        if (reelForm && !reelForm._v51) {
            reelForm._v51 = true;
            reelForm.setAttribute('novalidate', 'true');
        }

        // PATCH 5: Live stream isLive reset — also reset when modal overlay is clicked away
        document.addEventListener('click', function(e) {
            var overlay = e.target;
            if (overlay && overlay.id === 'go-live-modal-overlay' && window.liveStreamData) {
                // User tapped outside modal — reset live state
                window.liveStreamData.isLive = false;
                window.liveStreamData._localStream = null;
            }
        });

        // PATCH 6: Sign-in form — ensure login-view is visible when auth modal opens
        document.addEventListener('click', function(e) {
            var showLogin = e.target.closest && (e.target.closest('#login-signup-btn') || e.target.closest('#show-login'));
            if (showLogin) {
                setTimeout(function() {
                    var lv = document.getElementById('login-view');
                    var sv = document.getElementById('signup-view');
                    if (lv) lv.style.display = 'block';
                    if (sv) sv.style.display = 'none';
                    if (typeof window.generateCaptcha === 'function') window.generateCaptcha();
                }, 50);
            }
        });

        // PATCH 7: Complaint form upload — bind evidence file preview
        var compEvidence = document.getElementById('complaint-evidence');
        if (compEvidence && !compEvidence._v51) {
            compEvidence._v51 = true;
            compEvidence.addEventListener('change', function() {
                var p = document.getElementById('complaint-evidence-preview');
                if (!p) return;
                p.innerHTML = '';
                Array.from(this.files || []).forEach(function(f) {
                    var url = URL.createObjectURL(f);
                    var d = document.createElement('div');
                    d.style.cssText = 'display:inline-block;margin:4px;border-radius:8px;overflow:hidden;';
                    d.innerHTML = f.type.startsWith('video/')
                        ? '<video src="' + url + '" style="width:70px;height:70px;object-fit:cover;" muted></video>'
                        : f.type === 'application/pdf'
                        ? '<div style="width:70px;height:70px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:0.7rem;color:#555;"><i class="fas fa-file-pdf" style="font-size:1.4rem;color:#e74c3c;display:block;margin-bottom:4px;"></i>PDF</div>'
                        : '<img src="' + url + '" style="width:70px;height:70px;object-fit:cover;">';
                    p.appendChild(d);
                });
            });
        }

        // PATCH 8: PROMOTIONAL CAMPAIGN ALGORITHM ENGINE
        // ─────────────────────────────────────────────────────
        // Scoring formula:
        //   engagementScore  = likes*3 + comments*5 + shares*4 + retweets*3 + views*0.5
        //   recencyScore     = 1 / (1 + hoursOld * 0.15)          [decays over 48h]
        //   budgetScore      = log10(budgetNGN + 1) / log10(1000001) * 100
        //   audienceMatch    = overlap(post tags, viewer interests) * 20
        //   qualityScore     = hasMedia*10 + hasVerifiedAuthor*15 + KYC*10
        //   FINAL RANK       = engagementScore*0.35 + recencyScore*25 + budgetScore*0.25
        //                      + audienceMatch*0.1 + qualityScore*0.05
        // ─────────────────────────────────────────────────────
        (function() {
            // ── Internal promotion store ──────────────────────────
            if (!window._empyreanPromos) window._empyreanPromos = [];

            // Register a new promotion when user pays
            window.registerPromotion = function(postId, budgetNGN, targetAudience, durationDays) {
                var promo = {
                    id: 'promo-' + Date.now(),
                    postId: postId,
                    budgetNGN: parseFloat(budgetNGN) || 1000,
                    budgetRemaining: parseFloat(budgetNGN) || 1000,
                    targetAudience: targetAudience || 'all',
                    durationDays: parseInt(durationDays) || 3,
                    startTime: Date.now(),
                    endTime: Date.now() + (parseInt(durationDays)||3) * 86400000,
                    impressions: 0,
                    clicks: 0,
                    costPerImpression: Math.max(0.5, parseFloat(budgetNGN) / 10000),
                    active: true
                };
                window._empyreanPromos.push(promo);
                // Save to Firestore
                try {
                    if (window.fbDb && window.userState && window.userState.id) {
                        window.fbDb.collection('promotions').doc(promo.id).set(Object.assign({}, promo, {
                            userId: window.userState.id,
                            username: window.userState.username,
                            createdAt: new Date().toISOString()
                        }));
                    }
                } catch(e) {}
                return promo;
            };

            // ── Score a single post element for ranking ───────────
            window.scorePost = function(postEl, viewerInterests) {
                if (!postEl) return 0;
                var likes    = parseInt(postEl.querySelector('.like-count')?.textContent) || 0;
                var comments = parseInt(postEl.querySelector('.comment-count')?.textContent) || 0;
                var retweets = parseInt(postEl.querySelector('.retweet-count')?.textContent) || 0;
                var shares   = parseInt(postEl.querySelector('.share-count')?.textContent) || 0;
                var views    = parseInt(postEl.dataset.views || 0);

                // Engagement score (weighted)
                var engScore = likes*3 + comments*5 + shares*4 + retweets*3 + views*0.5;

                // Recency score (decays to ~0 after 72 hours)
                var createdAt = postEl.dataset.createdAt ? new Date(postEl.dataset.createdAt).getTime() : Date.now();
                var hoursOld = (Date.now() - createdAt) / 3600000;
                var recency = 1 / (1 + hoursOld * 0.15);

                // Promotion budget boost
                var budgetBoost = 0;
                var postId = postEl.dataset.postId || postEl.dataset.id;
                if (postId) {
                    var activePromo = (window._empyreanPromos || []).find(function(p) {
                        return p.postId === postId && p.active && Date.now() < p.endTime && p.budgetRemaining > 0;
                    });
                    if (activePromo) {
                        // Budget score: ₦1000 → 14pts, ₦10000 → 57pts, ₦100000 → 86pts, ₦1M → 100pts
                        budgetBoost = Math.log10(activePromo.budgetNGN + 1) / Math.log10(1000001) * 100;
                        // Audience match bonus
                        var interests = Array.isArray(viewerInterests) ? viewerInterests : [];
                        var postTags = (postEl.dataset.tags || '').split(',');
                        var matchCount = postTags.filter(function(t) { return interests.indexOf(t.trim()) > -1; }).length;
                        budgetBoost += matchCount * 5;
                    }
                }

                // Quality signals
                var hasMedia   = postEl.querySelector('.story-media-container, img, video') ? 10 : 0;
                var isVerified = postEl.querySelector('.verified-badge-small') ? 15 : 0;
                var qualityScore = hasMedia + isVerified;

                // Final weighted rank
                return (engScore * 0.35) + (recency * 25) + (budgetBoost * 0.25) + (qualityScore * 0.05);
            };

            // ── Re-rank the feed ──────────────────────────────────
            window.rankFeed = function() {
                var feed = document.getElementById('feed-container');
                if (!feed) return;
                var posts = Array.from(feed.querySelectorAll('.impact-story'));
                if (posts.length < 2) return;

                var interests = (window.userState && window.userState._interests) || [];
                var scored = posts.map(function(p) {
                    return { el: p, score: window.scorePost(p, interests) };
                });
                scored.sort(function(a, b) { return b.score - a.score; });

                // Re-insert in ranked order (promoted posts get pinned top)
                var fragment = document.createDocumentFragment();
                // Promoted posts first
                scored.filter(function(s) {
                    var id = s.el.dataset.postId || s.el.dataset.id;
                    return id && (window._empyreanPromos||[]).some(function(p) {
                        return p.postId === id && p.active && Date.now() < p.endTime;
                    });
                }).forEach(function(s) { fragment.appendChild(s.el); });
                // Then organic posts
                scored.filter(function(s) {
                    var id = s.el.dataset.postId || s.el.dataset.id;
                    return !id || !(window._empyreanPromos||[]).some(function(p) {
                        return p.postId === id && p.active && Date.now() < p.endTime;
                    });
                }).forEach(function(s) { fragment.appendChild(s.el); });

                feed.appendChild(fragment);
            };

            // ── Track impression when promo post is visible ───────
            window.trackPromoImpression = function(postId) {
                var promo = (window._empyreanPromos||[]).find(function(p) {
                    return p.postId === postId && p.active;
                });
                if (!promo) return;
                promo.impressions++;
                promo.budgetRemaining = Math.max(0, promo.budgetRemaining - promo.costPerImpression);
                if (promo.budgetRemaining <= 0) {
                    promo.active = false;
                    var badge = document.querySelector('[data-post-id="'+postId+'"] .sponsored-badge, [data-id="'+postId+'"] .sponsored-badge');
                    if (badge) badge.style.display = 'none';
                    if (window.showNotification) window.showNotification('Your promotion for post has ended — budget exhausted.', 'info');
                }
            };

            // ── Patch promotion-finalize-form to call registerPromotion ──
            document.addEventListener('submit', function(e) {
                if (!e.target || e.target.id !== 'promotion-finalize-form') return;
                setTimeout(function() {
                    var postId = (document.getElementById('promote-post-id') || {}).value;
                    var budget = parseFloat((document.getElementById('promo-budget') || {}).value) || 1000;
                    var duration = parseInt((document.getElementById('promo-duration') || {}).value) || 3;
                    var audience = (document.getElementById('promo-audience') || {}).value || 'all';
                    if (postId) {
                        window.registerPromotion(postId, budget, audience, duration);
                        // Mark post as sponsored in UI
                        var badge = document.querySelector('[data-post-id="'+postId+'"] .sponsored-badge, [data-id="'+postId+'"] .sponsored-badge');
                        if (badge) badge.style.display = 'inline-flex';
                        // Re-rank feed so promoted post rises
                        setTimeout(window.rankFeed, 300);
                    }
                }, 100);
            }, false);

            // ── Auto-rank feed every 5 minutes + on new post ─────
            setTimeout(function() {
                window.rankFeed();
                setInterval(window.rankFeed, 5 * 60 * 1000);
            }, 2000);

            // ── Intersection Observer: track visible promoted posts ─
            if ('IntersectionObserver' in window) {
                var _promoObserver = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        if (!entry.isIntersecting) return;
                        var el = entry.target;
                        var postId = el.dataset.postId || el.dataset.id;
                        if (postId && el.querySelector('.sponsored-badge[style*="inline"]')) {
                            window.trackPromoImpression(postId);
                        }
                    });
                }, { threshold: 0.5 });

                // Observe existing and future posts
                function observePosts() {
                    document.querySelectorAll('.impact-story:not([data-promo-observed])').forEach(function(p) {
                        p.dataset.promoObserved = '1';
                        _promoObserver.observe(p);
                    });
                }
                observePosts();
                // Re-observe when new posts are added
                var _feedEl = document.getElementById('feed-container');
                if (_feedEl) {
                    new MutationObserver(observePosts).observe(_feedEl, { childList: true });
                }
            }

            // ── Expose promo analytics to admin ──────────────────
            window.getPromoAnalytics = function() {
                return (window._empyreanPromos || []).map(function(p) {
                    return {
                        postId: p.postId,
                        budget: p.budgetNGN,
                        spent: p.budgetNGN - p.budgetRemaining,
                        impressions: p.impressions,
                        clicks: p.clicks,
                        ctr: p.impressions > 0 ? ((p.clicks / p.impressions)*100).toFixed(1)+'%' : '0%',
                        active: p.active,
                        daysLeft: Math.max(0, Math.ceil((p.endTime - Date.now()) / 86400000))
                    };
                });
            };

        })(); // end promo algorithm engine

    })(); // end v5.1 patches

}); // end onReady
})(); // end IIFE