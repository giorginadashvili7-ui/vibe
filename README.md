# Galactic Friends

A Firebase-based dark-mode social network prototype with email/password auth, base64 image uploads, and no Firebase Storage.

## Features
- Firebase Authentication with email/password
- Responsive dark UI for desktop, tablet, and mobile
- Photo upload or camera capture
- Automatic image compression before upload
- Base64 photo storage in Firestore (no Storage usage)
- Feed with recent posts
- Admin panel for managing posts and user profiles

## How it works
1. Sign up with email, password, and nickname.
2. Pick a photo or capture one with your camera.
3. Add a caption and publish.
4. Images are compressed client-side and saved as Base64 in Firestore.
5. The admin panel is accessible only for users with the `admin` custom claim.

## Setup
1. Open `firebase.js` and replace the config with your Firebase project values if needed.
2. Enable Firestore and Authentication (email/password) in Firebase Console.
3. Deploy Firestore rules from `firebaserules.txt`.
4. Serve the site with a local static server.

### Run locally
```bash
# from project root
cd "c:\Users\HP2\Desktop\web projects\social"
python -m http.server 8080
```
Then visit: `http://localhost:8080`

## Firebase Rules
Use the Firestore rules in `firebaserules.txt`.

## Notes
- This app avoids Firebase Storage to prevent storage billing.
- Because Firestore document size is limited, images are compressed to under ~950 KB.
- If you want admin privileges, assign the `admin: true` claim with Firebase Admin SDK.
