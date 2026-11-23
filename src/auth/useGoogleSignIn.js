// Web: Firebase popup flow. Returns { signIn, ready }.
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { ALLOWED_DOMAIN } from '../utils/domain';

export function useGoogleSignIn() {
  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    // UX hint only: pre-selects the domain in Google's account chooser.
    // It is NOT security; the real check happens in AuthContext.
    provider.setCustomParameters({ hd: ALLOWED_DOMAIN, prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  };
  return { signIn, ready: true };
}
