// Firebase & API Configuration
// This module handles all Firebase initialization and API keys

const API_CONFIG = {
    apiKey: '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',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile'
};

const GEMINI_CONFIG = {
    apiKey: 'AIzaSyAErOl-9MrM_A-HLRxvxFqx5b6WJWwi2Zs',
    apiUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent'
};

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
