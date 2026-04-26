// Firebase Configuration
// This module handles Firebase initialization and auth helpers

const firebaseConfig1 = {
    apiKey: "AIzaSyCFhUdOI9IqFCjBkg8zytanD5O1_67vCr4",
    authDomain: "manasa-ceaa2.firebaseapp.com",
    projectId: "manasa-ceaa2",
    storageBucket: "manasa-ceaa2.firebasestorage.app",
    messagingSenderId: "847284305108",
    appId: "1:847284305108:web:7a14698f76b3981c6acf41",
    measurementId: "G-CYX6QKJZSR"
};

const firebaseConfig2 = {
    apiKey: "AIzaSyAdIW3mf2yv9KWzEVTgb62Yquu8oHMWj7g",
    authDomain: "manasa-2.firebaseapp.com",
    projectId: "manasa-2",
    storageBucket: "manasa-2.firebasestorage.app",
    messagingSenderId: "713731774832",
    appId: "1:713731774832:web:bd33be9764c350b62997b5",
    measurementId: "G-LHVFYC2GQH"
};

let db1, db2;
let dbLeaderboard, dbAnalytics;
let db;

function initFirebase() {
    try {
        const app1 = firebase.initializeApp(firebaseConfig1, 'leaderboard-app');
        db1 = firebase.firestore(app1);
        dbLeaderboard = db1;

        const app2 = firebase.initializeApp(firebaseConfig2, 'analytics-app');
        db2 = firebase.firestore(app2);
        dbAnalytics = db2;
        
        db = dbLeaderboard;
    } catch (error) {
        // Firebase initialization error - silent fail for offline use
    }
}

// Initialize Firebase on load
initFirebase();

// Google Auth Provider
let googleProvider;
let firebaseAuth;

function initAuth() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebaseAuth = firebase.auth();
        googleProvider = new firebase.auth.GoogleAuthProvider();
        googleProvider.setCustomParameters({ prompt: 'select_account' });
    }
}

async function signInWithGoogle() {
    if (!firebaseAuth) initAuth();
    try {
        const result = await firebaseAuth.signInWithPopup(googleProvider);
        const tokenResult = await result.user.getIdTokenResult(true);
        if (!tokenResult?.claims?.admin) {
            await firebaseAuth.signOut();
            return {
                success: false,
                error: 'هذا الحساب غير مصرح له بالدخول كمسؤول. اطلب منح custom claim admin.',
            };
        }
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function hasAdminClaim(user) {
    if (!user) {
        return false;
    }

    try {
        const tokenResult = await user.getIdTokenResult(true);
        return Boolean(tokenResult?.claims?.admin);
    } catch {
        return false;
    }
}

async function signOut() {
    if (!firebaseAuth) initAuth();
    await firebaseAuth.signOut();
}

function onAuthStateChanged(callback) {
    if (!firebaseAuth) initAuth();
    firebaseAuth.onAuthStateChanged(callback);
}

if (typeof window !== 'undefined') {
    window.initAuth = initAuth;
    window.signInWithGoogle = signInWithGoogle;
    window.hasAdminClaim = hasAdminClaim;
    window.adminSignOut = signOut;
    window.onAuthStateChanged = onAuthStateChanged;
}
