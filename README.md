# HB+ Auth: Cross-Platform Google Login with Domain Restriction

A React Native (Expo) app with **React Native for Web**. One codebase runs on Android, iOS and the browser.
Users sign in with Google; only emails on the allowed domain (default `@hbplus.fit`) get in.

## Features
- Google OAuth 2.0 sign-in through Firebase Authentication
- Email-domain verification, with the access-restricted message for everyone else
- Protected Dashboard (unreachable without a valid, approved session)
- Logout, loading states (session restore and sign-in) and error handling
- Bonus: Admin/User roles, user records stored in Firestore, protected routes

## Tech stack
React Native 0.88 + Expo 58, react-native-web, Firebase Auth + Firestore, expo-auth-session (native Google flow).

## Folder structure
```
App.js                      Route guard (loading -> Login or Dashboard)
src/
  firebase.js               Firebase init (web)
  firebase.native.js        Firebase init (Android/iOS, AsyncStorage persistence)
  auth/
    AuthContext.js          Auth state, domain gate, logout, errors
    useGoogleSignIn.js      Web: Firebase popup flow
    useGoogleSignIn.native.js  Native: expo-auth-session -> Firebase credential
  screens/LoginScreen.js    "Login with Google" + error banner
  screens/DashboardScreen.js  Protected page, role badge, logout
  utils/domain.js           Domain check + role lookup
  theme.js                  Colors
```
Platform files (`.native.js`) are picked automatically by Metro, so the screens are shared.

## Setup
1. `npm install`
2. Create a Firebase project. Add a **Web app** and copy its config values.
3. Firebase Console > Authentication > Sign-in method > enable **Google**.
4. Authentication > Settings > Authorized domains: add `localhost` and your Netlify domain.
5. (Bonus) Create a Firestore database. Suggested rules:
   ```
   match /users/{uid} {
     allow read, write: if request.auth != null
       && request.auth.uid == uid
       && request.auth.token.email.matches('.*@hbplus[.]fit');
   }
   ```
6. `cp .env.example .env` and fill in the values.
7. For Android/iOS only: create OAuth client IDs (Web, Android, iOS) in Google Cloud Console and add them to `.env`.
8. Run:
   - Web: `npx expo start --web`
   - Android/iOS emulator: `npx expo start`, then press `a` or `i`

## Authentication flow
1. User taps **Login with Google**.
2. Web opens the Google popup (Firebase `signInWithPopup`). Native opens the Google consent screen
   (`expo-auth-session`) and exchanges the returned ID token for a Firebase credential.
3. Firebase creates the session; `onAuthStateChanged` fires.
4. `AuthContext` runs the domain gate (below). Approved users reach the Dashboard.
   Everyone else is signed out immediately and sees:
   *"Access restricted. Please login using your official domain email."*
5. Logout calls `signOut`, and the guard returns the user to Login.

## How the domain restriction works
- `isAllowedEmail()` takes the part after the **last `@`** and requires an **exact** match with the allowed domain,
  case-insensitively. `x@evilhbplus.fit` and `x@hbplus.fit.evil.com` are rejected (a plain `endsWith` check
  would let the first one through). The email must also be Google-verified.
- The check runs on **every** auth-state change, including restored sessions, so a rejected account can never
  stay logged in after a refresh.
- The `hd=hbplus.fit` parameter is sent to Google so the account chooser favors that domain. This is a UX hint
  only and is not relied on for security.
- Honest limitation: the gate lives in the client. For production, also enforce it server-side
  (a Firebase blocking function `beforeSignIn`, or Firestore/Storage rules that check `request.auth.token.email`,
  as in the rules above). Client checks alone can be bypassed by a modified client.

## Security notes
- No raw tokens are stored by this app. Firebase manages the session (IndexedDB on web, AsyncStorage on native).
- The dashboard is rendered by a guard component, not a URL, so typing a path cannot reach it without login.
- Secrets are in `.env` (git-ignored). Firebase web config values are public identifiers, not secrets,
  so access control comes from Auth rules, not from hiding them.
- Roles are read from `EXPO_PUBLIC_ADMIN_EMAILS`. This is a UI demo; real role enforcement needs custom
  claims set by a trusted backend.

## Deploy to Netlify
- Build command: `npx expo export --platform web`; publish directory: `dist` (already in `netlify.toml`).
- Add the same `EXPO_PUBLIC_*` variables in Netlify > Site settings > Environment variables, then redeploy.
- Add the Netlify domain to Firebase Authorized domains.

## What was tested
- Web and Android production bundles compile.
- Login screen renders with no runtime errors in a headless browser.
- Domain-validation logic passes 10 edge cases (valid, wrong domain, look-alike domains, empty, null).
- Full Google sign-in needs your Firebase and OAuth credentials, so it is verified end to end only after you add them.
