import { Bell, LogOut, ShieldCheck, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Divider, Input, Sheet, Text } from '../ui';
import { useAuth } from '@/lib/stores/auth';
import { useProfile } from '@/lib/stores/profile';
import { colors, radius, spacing } from '@/theme';

interface SettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsSheet({ visible, onClose }: SettingsSheetProps) {
  const profile = useProfile((s) => s.profile);
  const rename = useProfile((s) => s.rename);
  const signOut = useAuth((s) => s.signOut);
  const [draftName, setDraftName] = useState(profile.name);

  const handleSignOut = () => {
    onClose();
    // The (tabs) layout watches isAuthed and redirects to /sign-in.
    signOut();
  };

  const handleSave = () => {
    const next = draftName.trim();
    if (next && next !== profile.name) rename(next);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text variant="titleLg" style={styles.title}>
        Settings
      </Text>

      <Input
        label="Display name"
        value={draftName}
        onChangeText={setDraftName}
        autoCapitalize="words"
        maxLength={32}
      />

      <View style={styles.list}>
        <Row icon={<Bell size={18} color={colors.text} />} label="Notifications" caption="Coming soon" />
        <Row
          icon={<ShieldCheck size={18} color={colors.text} />}
          label="Privacy & data"
          caption="What we store"
        />
      </View>

      <Divider style={styles.divider} />

      <Pressable onPress={handleSignOut} style={styles.danger} accessibilityRole="button">
        <LogOut size={18} color={colors.danger} />
        <Text variant="button" color={colors.danger}>
          Sign out
        </Text>
      </Pressable>

      <Pressable
        onPress={() => {
          // Placeholder for delete-account flow.
        }}
        style={styles.danger}
        accessibilityRole="button"
      >
        <Trash2 size={18} color={colors.danger} />
        <Text variant="button" color={colors.danger}>
          Delete account
        </Text>
      </Pressable>

      <Button label="Save" size="lg" fullWidth style={styles.save} onPress={handleSave} />
    </Sheet>
  );
}

function Row({
  icon,
  label,
  caption,
}: {
  icon: React.ReactNode;
  label: string;
  caption?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text variant="titleSm">{label}</Text>
        {caption ? (
          <Text variant="caption" color={colors.textMuted}>
            {caption}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.base },
  list: { marginTop: spacing.base, gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  divider: { marginVertical: spacing.base },
  danger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  save: { marginTop: spacing.lg },
});
