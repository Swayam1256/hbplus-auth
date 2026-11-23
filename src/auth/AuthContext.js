import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase';
import { isAllowedEmail, roleFor, RESTRICTED_MESSAGE } from '../utils/domain';
import { useGoogleSignIn } from './useGoogleSignIn';

const AuthContext = createContext(null);

function friendlyError(e) {
  const code = e?.code || '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Sign-in was cancelled.';
  }
  if (code === 'auth/popup-blocked') return 'Popup was blocked. Allow popups and try again.';
  if (code === 'auth/network-request-failed') return 'Network error. Check your connection.';
  return 'Something went wrong while signing in. Please try again.';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('user');
  const [initializing, setInitializing] = useState(true); // restoring session
  const [busy, setBusy] = useState(false); // sign-in in progress
  const [error, setError] = useState(null);

  const { signIn: startGoogle, ready } = useGoogleSignIn({
    onError: (e) => {
      setError(friendlyError(e));
      setBusy(false);
    },
  });

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setInitializing(false);
      return undefined;
    }
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setInitializing(false);
        setBusy(false);
        return;
      }
      // Domain gate: runs for every session, including restored ones.
      if (!fbUser.emailVerified || !isAllowedEmail(fbUser.email)) {
        setError(RESTRICTED_MESSAGE);
        setUser(null);
        setInitializing(false);
        setBusy(false);
        try {
          await fbSignOut(auth);
        } catch (_) {}
        return;
      }
      const r = roleFor(fbUser.email);
      setRole(r);
      setUser({ uid: fbUser.uid, email: fbUser.email, name: fbUser.displayName, photo: fbUser.photoURL });
      setError(null);
      setInitializing(false);
      setBusy(false);
      // Bonus: store user data. Failure must never block login.
      try {
        await setDoc(
          doc(db, 'users', fbUser.uid),
          { email: fbUser.email, name: fbUser.displayName || null, role: r, lastLoginAt: serverTimestamp() },
          { merge: true }
        );
      } catch (_) {}
    });
    return unsub;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      await startGoogle();
      // Web: popup resolved; onAuthStateChanged takes over.
      // Native: the response arrives later via the hook's effect.
    } catch (e) {
      setError(friendlyError(e));
      setBusy(false);
    }
  }, [startGoogle]);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await fbSignOut(auth);
    } catch (e) {
      setError('Could not log out. Please try again.');
    }
  }, []);

  const value = useMemo(
    () => ({ user, role, initializing, busy, error, ready, signInWithGoogle, logout, setError }),
    [user, role, initializing, busy, error, ready, signInWithGoogle, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
