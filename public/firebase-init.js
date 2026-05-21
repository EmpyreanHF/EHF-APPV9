// =====================================================
// FIREBASE PRE-STUBS
// Ensures fbAuth/fbDb/fbStorage always exist before
// Firebase SDK loads. If SDK fails, app runs locally.
// =====================================================

window._firebaseLoaded = false;
window._firebaseInitAttempts = 0;

const _noop = () => Promise.resolve({ exists: false, data: () => ({}), user: { uid: 'local-' + Date.now() } });

// Static stub object — avoids infinite recursion when chaining
// .where().orderBy().limit() etc. in offline/fallback mode
const _colStub = {
    add: _noop, set: _noop, get: _noop, update: _noop, delete: _noop,
    where: function() { return _colStub; },
    orderBy: function() { return _colStub; },
    limit: function() { return _colStub; },
    doc: function() { return _colStub; },
    onSnapshot: function(cb) {
        try { cb({ docs: [], empty: true, forEach: function() {} }); } catch(e) {}
        return function() {};
    }
};
const _col = function() { return _colStub; };

window.fbAuth = {
    signInWithEmailAndPassword: _noop,
    createUserWithEmailAndPassword: _noop,
    signOut: () => Promise.resolve(),
    onAuthStateChanged: (cb) => { try { cb(null); } catch (e) {} return () => {}; },
    currentUser: null,
    sendPasswordResetEmail: _noop,
    signInWithPopup: _noop
};
window.fbDb = {
    collection: _col,
    FieldValue: {
        serverTimestamp: () => new Date(),
        arrayUnion: (...a) => a,
        increment: n => n
    }
};
window.fbStorage = { ref: () => ({ put: _noop, getDownloadURL: _noop }) };

// Called after Firebase SDK scripts load
window._initFirebase = function () {
    window._firebaseInitAttempts++;
    try {
        if (typeof firebase === 'undefined' || !firebase.initializeApp) {
            console.warn('[Firebase] SDK not available, using local-only mode');
            return false;
        }
        let app;
        try {
            app = firebase.app();
        } catch (e) {
            const cfg = window._appConfig && window._appConfig.firebase;
            if (!cfg || !cfg.apiKey) {
                console.warn('[Firebase] Config not loaded yet — will retry');
                return false;
            }
            app = firebase.initializeApp(cfg);
        }
        window.fbAuth    = firebase.auth();
        window.fbDb      = firebase.firestore();
        window.fbStorage = firebase.storage();
        window._firebaseLoaded = true;
        console.log('[Firebase] ✅ Initialized successfully (attempt ' + window._firebaseInitAttempts + ')');
        // Dispatch event so app-startup and index.html listeners can start Firestore listeners
        try { window.dispatchEvent(new CustomEvent('empyrean:firebase-ready')); } catch(e) {}
        return true;
    } catch (err) {
        console.warn('[Firebase] Init failed:', err.message);
        return false;
    }
};