// Android/iOS: Google OAuth 2.0 via expo-auth-session, then exchange the
// Google ID token for a Firebase credential. Errors are reported via onError.
import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebase';
import { ALLOWED_DOMAIN } from '../utils/domain';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn({ onError } = {}) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    extraParams: { hd: ALLOWED_DOMAIN },
  });

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      signInWithCredential(auth, GoogleAuthProvider.credential(response.params.id_token)).catch(
        (e) => onError && onError(e)
      );
    } else if (response.type === 'error') {
      onError && onError(response.error || new Error('Google sign-in failed'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const signIn = async () => {
    await promptAsync();
  };
  return { signIn, ready: Boolean(request) };
}
