import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProviderButton } from '@/components/features/ProviderButton';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/lib/stores/auth';
import type { AuthProvider } from '@/lib/types';
import { colors, spacing } from '@/theme';

const PROVIDERS: ReadonlyArray<{ id: AuthProvider; label: string }> = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'notion', label: 'Continue with Notion' },
  { id: 'onenote', label: 'Continue with OneNote' },
  { id: 'email', label: 'Continue with Email' },
];

export default function SignIn() {
  const router = useRouter();
  const signIn = useAuth((s) => s.signIn);
  const [pending, setPending] = useState<AuthProvider | null>(null);

  async function handleSignIn(provider: AuthProvider) {
    setPending(provider);
    try {
      await signIn(provider);
      router.replace('/(tabs)');
    } finally {
      setPending(null);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
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
            Sign in
          </Text>
          <Text variant="body" color={colors.textMuted} center style={styles.tagline}>
            Brew habits. Earn XP. Climb the Latte Leagues.
          </Text>
        </View>

        <View style={styles.providers}>
          {PROVIDERS.map((p) => (
            <ProviderButton
              key={p.id}
              provider={p.id}
              label={p.label}
              onPress={() => handleSignIn(p.id)}
              loading={pending === p.id}
              disabled={pending !== null && pending !== p.id}
            />
          ))}
        </View>

        <Text variant="caption" color={colors.textSubtle} center style={styles.legal}>
          By continuing you agree to our Terms and Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, gap: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.xxl },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  logoImage: { width: 64, height: 64 },
  tagline: { marginTop: spacing.xs, maxWidth: 280 },
  providers: { gap: spacing.md, marginTop: spacing.lg },
  legal: { marginTop: 'auto', paddingTop: spacing.xl, paddingHorizontal: spacing.lg },
});
