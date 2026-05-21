/**
 * Empyrean Humanitarian Platform — Render Server
 * ─────────────────────────────────────────────
 * All sensitive API keys live ONLY in Render environment variables.
 * The client fetches /api/config on load and receives only what it needs.
 * Firebase Admin SDK operations that need a service account key run here.
 */

'use strict';

const express  = require('express');
const path     = require('path');
const cors     = require('cors');
const helmet   = require('helmet');
const https    = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security headers (Helmet) ─────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'", "'unsafe-inline'", "'unsafe-eval'",
                "https://www.gstatic.com", "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com", "https://checkout.flutterwave.com",
                "https://api.cloudinary.com"
            ],
            styleSrc:  ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            imgSrc:    ["'self'", "data:", "blob:", "https:", "http:"],
            mediaSrc:  ["'self'", "blob:", "https:", "http:"],
            connectSrc:["'self'", "https:", "wss:", "blob:"],
            fontSrc:   ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            frameSrc:  ["'self'", "https://checkout.flutterwave.com"],
        }
    },
    crossOriginEmbedderPolicy: false,
}));

app.use(cors());
app.use(express.json());

// ── /api/config ── Returns only PUBLIC keys the browser needs ─────────────
// SECRET keys (Firebase service account, Flutterwave secret, etc.) stay here.
// Only PUBLISHABLE / PRESET keys that Cloudinary and Flutterwave require
// on the client side are forwarded.
app.get('/api/config', (req, res) => {
    // Validate that all required env vars are present
    const required = [
        'FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_PROJECT_ID',
        'FIREBASE_STORAGE_BUCKET', 'FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_APP_ID',
        'CLOUDINARY_CLOUD', 'CLOUDINARY_PRESET',
        'FLW_PUBLIC_KEY'
    ];
    const missing = required.filter(k => !process.env[k]);
    if (missing.length > 0) {
        console.error('[Config] Missing env vars:', missing.join(', '));
        return res.status(500).json({ error: 'Server misconfiguration', missing });
    }

    res.json({
        firebase: {
            apiKey:            process.env.FIREBASE_API_KEY,
            authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
            projectId:         process.env.FIREBASE_PROJECT_ID,
            storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId:             process.env.FIREBASE_APP_ID,
            measurementId:     process.env.FIREBASE_MEASUREMENT_ID || ''
        },
        cloudinary: {
            cloud:  process.env.CLOUDINARY_CLOUD,
            preset: process.env.CLOUDINARY_PRESET
        },
        flutterwave: {
            publicKey: process.env.FLW_PUBLIC_KEY
        }
    });
});

// ── /api/notify ── Server-side push notification dispatcher ──────────────
// Mirrors the Android dispatchNotification() pattern from the integration notes.
// Sends FCM push via Firebase Admin SDK (service account key never leaves server).
app.post('/api/notify', async (req, res) => {
    const { section, summary, imageUrl, token } = req.body;
    if (!section || !summary) return res.status(400).json({ error: 'section and summary required' });

    // Only attempt if FCM Admin is configured
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        return res.json({ sent: false, reason: 'FCM not configured' });
    }

    try {
        // Lazy-init Firebase Admin (avoids crash when env var missing in dev)
        if (!app._firebaseAdmin) {
            const admin = require('firebase-admin');
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
            app._firebaseAdmin = admin;
        }
        const admin = app._firebaseAdmin;
        const message = {
            token,
            notification: {
                title: section + ' Update',
                body:  summary,
                ...(imageUrl ? { imageUrl } : {})
            },
            android: { priority: 'high' },
            apns:    { payload: { aps: { sound: 'default' } } }
        };
        const result = await admin.messaging().send(message);
        res.json({ sent: true, messageId: result });
    } catch (err) {
        console.error('[Notify] FCM error:', err.message);
        res.status(500).json({ sent: false, error: err.message });
    }
});

// ── /api/flw/verify ── Verify Flutterwave transaction (secret key stays server) ──
app.post('/api/flw/verify', async (req, res) => {
    const { txRef } = req.body;
    if (!txRef) return res.status(400).json({ error: 'txRef required' });
    if (!process.env.FLW_SECRET_KEY) return res.status(500).json({ error: 'FLW_SECRET_KEY not configured' });

    const options = {
        hostname: 'api.flutterwave.com',
        path:     '/v3/transactions/verify_by_reference?tx_ref=' + encodeURIComponent(txRef),
        method:   'GET',
        headers:  { Authorization: 'Bearer ' + process.env.FLW_SECRET_KEY }
    };
    const flwRes = await new Promise((resolve, reject) => {
        const req2 = https.request(options, r => {
            let body = '';
            r.on('data', d => body += d);
            r.on('end',  () => resolve({ status: r.statusCode, body }));
        });
        req2.on('error', reject);
        req2.end();
    });
    try { res.json(JSON.parse(flwRes.body)); } catch { res.json({ raw: flwRes.body }); }
});

// ── Static files (serve the built app) ───────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    setHeaders(res, filePath) {
        // No-cache for HTML so config changes take effect immediately
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
    }
}));

// SPA fallback — all unknown routes serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Empyrean server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});