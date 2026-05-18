import * as AppleAuthentication from 'expo-apple-authentication';
import { Image } from 'expo-image';
import { Mail } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProviderButton } from '@/components/features';
import { Button, Divider, Input, Text } from '@/components/ui';
import {
  AuthCancelledError,
  isAppleAuthAvailable,
  signInWithApple,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from '@/lib/auth';
import { errorMessage } from '@/lib/utils/errors';
import { colors, radius, spacing } from '@/theme';

type Mode = 'signin' | 'signup';
type Pending = 'apple' | 'google' | 'email' | null;

export default function SignIn() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    void isAppleAuthAvailable().then(setAppleAvailable);
  }, []);

  // Routing to the app on success is handled by the root auth guard.
  async function run(provider: Pending, fn: () => Promise<void>) {
    setError(null);
    setNotice(null);
    setPending(provider);
    try {
      await fn();
    } catch (e) {
      if (!(e instanceof AuthCancelledError)) setError(errorMessage(e));
    } finally {
      setPending(null);
    }
  }

  const emailValid = /\S+@\S+\.\S+/.test(email.trim());
  const passwordValid = password.length >= 6;
  const emailFormValid = emailValid && passwordValid;

  async function handleEmail() {
    if (!emailFormValid) {
      setError(
        !emailValid
          ? 'Enter a valid email address.'
          : 'Password must be at least 6 characters.',
      );
      return;
    }
    await run('email', async () => {
      if (mode === 'signup') {
        const { needsEmailConfirmation } = await signUpWithEmail(email, password);
        if (needsEmailConfirmation) {
          setNotice('Check your inbox to confirm your email, then sign in.');
          setMode('signin');
        }
      } else {
        await signInWithEmail(email, password);
      }
    });
  }

  const busy = pending !== null;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../assets/coffee-cup.png')}
                style={styles.logoImage}
                contentFit="contain"
              />
            </View>
            <Text variant="displayMd" center>
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </Text>
            <Text variant="body" color={colors.textMuted} center style={styles.tagline}>
              Brew habits. Earn XP. Climb the Latte Leagues.
            </Text>
          </View>

          <View style={styles.providers}>
            {appleAvailable ? (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={radius.pill}
                style={styles.appleButton}
                onPress={() => run('apple', signInWithApple)}
              />
            ) : null}

            <ProviderButton
              label="Continue with Google"
              logo={require('../assets/oauth/google.png')}
              onPress={() => run('google', signInWithGoogle)}
              loading={pending === 'google'}
              disabled={busy}
            />
          </View>

          <View style={styles.dividerRow}>
            <Divider style={styles.dividerLine} />
            <Text variant="caption" color={colors.textSubtle}>
              or
            </Text>
            <Divider style={styles.dividerLine} />
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              leftIcon={<Mail size={18} color={colors.iconMuted} />}
              editable={!busy}
            />
            <Input
              label="Password"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              editable={!busy}
            />

            {error ? (
              <Text variant="caption" color={colors.danger}>
                {error}
              </Text>
            ) : null}
            {notice ? (
              <Text variant="caption" color={colors.success}>
                {notice}
              </Text>
            ) : null}

            <Button
              label={mode === 'signin' ? 'Sign in' : 'Create account'}
              size="lg"
              fullWidth
              loading={pending === 'email'}
              disabled={busy}
              onPress={handleEmail}
            />
          </View>

          <Pressable
            onPress={() => {
              setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
              setError(null);
              setNotice(null);
            }}
            disabled={busy}
            accessibilityRole="button"
            style={styles.switchMode}
          >
            <Text variant="body" color={colors.textMuted}>
              {mode === 'signin' ? "New here? " : 'Already have an account? '}
              <Text variant="body" color={colors.primary}>
                {mode === 'signin' ? 'Create an account' : 'Sign in'}
              </Text>
            </Text>
          </Pressable>

          <Text variant="caption" color={colors.textSubtle} center style={styles.legal}>
            By continuing you agree to our Terms and Privacy Policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
  hero: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logoImage: { width: 56, height: 56 },
  tagline: { marginTop: spacing.xs, maxWidth: 280 },
  providers: { gap: spacing.md },
  appleButton: { height: 56, width: '100%' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dividerLine: { flex: 1 },
  form: { gap: spacing.md },
  switchMode: { alignSelf: 'center', paddingVertical: spacing.xs },
  legal: { marginTop: 'auto', paddingTop: spacing.base, paddingHorizontal: spacing.lg },
});
