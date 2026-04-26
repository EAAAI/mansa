/**
 * Set Admin Custom Claim
 * ========================
 * Run this script ONCE to grant admin access to a Google account.
 *
 * HOW TO USE:
 * 1. Download your service account key from Firebase Console:
 *    → Project Settings → Service accounts → Generate new private key
 *    → Save the file as "serviceAccountKey.json" in this same folder (scripts/)
 *
 * 2. Put the target user's email or UID in the config below
 *
 * 3. Install the Admin SDK (once):
 *    npm install firebase-admin
 *
 * 4. Run this script:
 *    node scripts/set-admin-claim.js
 *
 * ⚠️  NEVER commit serviceAccountKey.json to git — it's already in .gitignore
 */

const admin = require("firebase-admin");
const path = require("path");

// ============================================
// CONFIG — Edit these values
// ============================================
const SERVICE_ACCOUNT_PATH = path.join(__dirname, "serviceAccountKey.json");
const TARGET_EMAIL = "ahmedahmedkaka0@gmail.com"; // ← put your Google account email here
// ============================================

async function setAdminClaim() {
  // Initialize Firebase Admin
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  try {
    // Find user by email
    const user = await admin.auth().getUserByEmail(TARGET_EMAIL);
    console.log(`Found user: ${user.uid} (${user.email})`);

    // Set the admin custom claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    console.log(`✅ Admin claim set successfully for: ${user.email}`);
    console.log(
      "   The user must sign out and sign back in for the claim to take effect.",
    );
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      console.error(`❌ No user found with email: ${TARGET_EMAIL}`);
      console.error(
        "   Make sure the user has signed in to the app at least once via Google.",
      );
    } else {
      console.error("❌ Error setting admin claim:", error.message);
    }
  } finally {
    process.exit(0);
  }
}

setAdminClaim();
