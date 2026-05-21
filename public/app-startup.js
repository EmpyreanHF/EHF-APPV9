(function empyreanStartupSync() {
    'use strict';

    // 1. Re-run Firebase init if it hasn't loaded yet (handles slow CDN)
    var _fbRetry = 0;
    var _fbRetryTimer = setInterval(function() {
        _fbRetry++;
        if (window._firebaseLoaded) {
            clearInterval(_fbRetryTimer);
            console.log('[Empyrean] ✅ Firebase confirmed loaded on retry ' + _fbRetry);
            return;
        }
        if (typeof firebase !== 'undefined' && typeof window._initFirebase === 'function') {
            var ok = window._initFirebase();
            if (ok) { clearInterval(_fbRetryTimer); console.log('[Empyrean] ✅ Firebase initialized on retry ' + _fbRetry); }
        }
        if (_fbRetry >= 10) {
            clearInterval(_fbRetryTimer);
            console.warn('[Empyrean] Firebase did not load after 10 retries — running offline mode.');
        }
    }, 500);

    // 2. On page load, generate captcha if auth modal is visible or login view is open
    window.addEventListener('load', function() {
        var loginView = document.getElementById('login-view');
        var authModal = document.getElementById('auth-modal-overlay');
        if (loginView && authModal && authModal.classList.contains('show') && loginView.style.display !== 'none') {
            if (typeof window.generateCaptcha === 'function') window.generateCaptcha();
        }

        // 3. Re-register Google auth buttons after full page load (ensures no stale handlers)
        // The secondary Google auth patch already runs this, but we ensure one more time
        setTimeout(function() {
            if (!document.querySelector('.btn-google[data-gcl]')) {
                document.querySelectorAll('.btn-google').forEach(function(btn) {
                    if (btn._gcl) return; // already patched
                    btn._gcl = true;
                    btn.dataset.gcl = '1';
                    // The existing handler in the fix-pack IIFE handles clicks — this just marks them
                });
            }
        }, 300);

        // 4. Ensure Agora SDK availability flag is current
        window._agoraAvailable = (typeof AgoraRTC !== 'undefined');
        console.log('[Empyrean] Agora SDK available:', window._agoraAvailable);

        // 5. Fix any stale liveStreamData.isLive = true on fresh page load
        if (window.liveStreamData && window.liveStreamData.isLive && !window.liveStreamData._localStream) {
            window.liveStreamData.isLive = false;
            console.log('[Empyrean] Cleared stale live stream state on startup.');
        }
    });

    // 6. Expose debug helper
    window._empyreanDebug = function() {
        return {
            firebaseLoaded: window._firebaseLoaded,
            agoraAvailable: window._agoraAvailable,
            isGuest: window.isGuest,
            userState: window.userState ? { id: window.userState.id, email: window.userState.email, name: window.userState.fullName } : null,
            liveState: window.liveStreamData ? { isLive: window.liveStreamData.isLive, channel: window.liveStreamData._agoraChannel } : null,
            agoraStatus: window._agora ? window._agora.status() : 'not loaded'
        };
    };
    console.log('[Empyrean] 🚀 Platform startup sync complete. Debug: window._empyreanDebug()');
})();