import { Redirect } from 'expo-router';

/**
 * Placeholder tab — the center "+" button intercepts tab presses (see _layout)
 * and pushes the modal /new-task screen instead. If users somehow land here
 * directly, send them home.
 */
export default function NewTaskPlaceholder() {
  return <Redirect href="/(tabs)" />;
}
