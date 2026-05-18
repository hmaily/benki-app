/**
 * Authentication helpers wrapping Supabase Auth.
 *
 * Email/password and Google (OAuth via in-app browser + PKCE) work on all
 * platforms. Apple uses the native credential sheet and is iOS-only.
 * Session state itself lives in stores/auth.ts.
 */
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from './supabase';

// Required so the browser-based OAuth flow can complete on web/native.
WebBrowser.maybeCompleteAuthSession();

/** Thrown when the user dismisses a sign-in flow — not a real failure. */
export class AuthCancelledError extends Error {
  constructor() {
    super('Sign-in was cancelled');
    this.name = 'AuthCancelledError';
  }
}

// Deep-link target Supabase redirects back to. Must be registered in the
// Supabase dashboard under Authentication -> URL Configuration.
const redirectTo = makeRedirectUri();

async function createSessionFromUrl(url: string): Promise<void> {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const { code } = params;
  if (!code) throw new Error('No authorization code in the sign-in redirect');

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ needsEmailConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  // When email confirmation is on, signUp returns no session.
  return { needsEmailConfirmation: data.session === null };
}

export async function signInWithGoogle(): Promise<void> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error('Could not start Google sign-in');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') throw new AuthCancelledError();

  await createSessionFromUrl(result.url);
}

export async function signInWithApple(): Promise<void> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) {
      throw new Error('Apple did not return an identity token');
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });
    if (error) throw error;

    // Apple only sends the name on the very first authorization. Capture it
    // onto the profile; otherwise the name falls back to the email prefix.
    if (credential.fullName?.givenName) {
      const name = [credential.fullName.givenName, credential.fullName.familyName]
        .filter(Boolean)
        .join(' ');
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase.from('profiles').update({ name }).eq('id', data.user.id);
      }
    }
  } catch (e) {
    if (
      e instanceof Error &&
      'code' in e &&
      (e as { code?: string }).code === 'ERR_REQUEST_CANCELED'
    ) {
      throw new AuthCancelledError();
    }
    throw e;
  }
}

export async function isAppleAuthAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return AppleAuthentication.isAvailableAsync();
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
