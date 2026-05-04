const firebaseConfig = {
  apiKey: "AIzaSyBWw7k85mM9HpIW0tbMm4bCmP3Bs8mYNWk",
  authDomain: "lyali-project.firebaseapp.com",
  projectId: "lyali-project",
  storageBucket: "lyali-project.firebasestorage.app",
  messagingSenderId: "507061744829",
  appId: "1:507061744829:web:fa5170f738df6d5a5033d4",
  measurementId: "G-JFYPYR8D39",
};

let db;
let storage;

try {
  const app = firebase.initializeApp(firebaseConfig);
  db = firebase.firestore(app);
  if (firebase.storage) {
    storage = firebase.storage(app);
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

let firebaseAuth;
let googleProvider;

function initAuth() {
  if (firebaseAuth) return;
  if (typeof firebase !== "undefined" && firebase.auth) {
    firebaseAuth = firebase.auth();
    googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
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
        error: "هذا الحساب غير مصرح له بالدخول كمسؤول. يرجى التواصل مع الإدارة.",
      };
    }
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function hasAdminClaim(user) {
  if (!user) return false;
  try {
    const tokenResult = await user.getIdTokenResult(true);
    return Boolean(tokenResult?.claims?.admin);
  } catch {
    return false;
  }
}

async function adminSignOut() {
  if (!firebaseAuth) initAuth();
  await firebaseAuth.signOut();
}

function onAuthStateChanged(callback) {
  if (!firebaseAuth) initAuth();
  firebaseAuth.onAuthStateChanged(callback);
}

export { db, storage, initAuth, signInWithGoogle, hasAdminClaim, adminSignOut, onAuthStateChanged };

