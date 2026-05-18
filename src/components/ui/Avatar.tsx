import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { colors, fontFamily } from '@/theme';
import { avatarColorFor, initialsFor } from '@/lib/utils/format';

import { Text } from './Text';

interface AvatarProps {
  name: string;
  seed?: string;
  size?: number;
  source?: ImageSource | number;
  online?: boolean;
}

export function Avatar({ name, seed, size = 44, source, online }: AvatarProps) {
  const initials = initialsFor(name);
  const bg = avatarColorFor(seed ?? name);
  const fontSize = Math.round(size * 0.42);

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      {source ? (
        <Image source={source} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} contentFit="cover" />
      ) : (
        <View style={[styles.fallback, { backgroundColor: bg, borderRadius: size / 2 }]}>
          <Text style={{ fontFamily: fontFamily.semibold, fontSize, color: colors.white }}>
            {initials}
          </Text>
        </View>
      )}
      {online ? (
        <View
          style={[
            styles.dot,
            { width: size * 0.28, height: size * 0.28, borderRadius: size * 0.14 },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  image: {},
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  dot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
