# Benki

A gamified study companion — brew habits, earn XP, climb the Latte Leagues with friends. Built from the `Benki/Dojo/Kohi` Figma design.

> **Benki** (勉強, study) · **Dōjō** (道場, training hall) · **Kōhī** (コーヒー, coffee)

## Tech stack

- **Expo SDK 52** + **React Native 0.76** (iOS / Android / Web)
- **Expo Router** v4 (file-based routing)
- **TypeScript** (strict + `noUncheckedIndexedAccess`)
- **Zustand** for client state
- **lucide-react-native** for icons (1:1 with the Figma icon set)
- **date-fns** for date math
- **@expo-google-fonts/inter** for the Inter typeface
- Pure in-memory mock data — no backend, no persistence

## Run it

```bash
npm install
npx expo start
```

Then press `i` for iOS Simulator, `a` for Android emulator, or `w` for web.
Mobile recommended — the design is mobile-first.

## Project layout

```
app/                       Expo Router
├─ _layout.tsx              Root layout: fonts, theme, Stack
├─ index.tsx                Redirect → /(tabs) or /sign-in
├─ sign-in.tsx              Auth screen (no shell)
├─ new-task.tsx             Modal task-creation screen
└─ (tabs)/
   ├─ _layout.tsx           Bottom tab bar (with floating + button)
   ├─ index.tsx             Home
   ├─ leaderboard.tsx
   ├─ friends.tsx
   ├─ profile.tsx
   └─ new-task-placeholder.tsx   intercepted by FAB

src/
├─ theme/                   Design tokens (colors, typography, spacing, radii, shadow)
├─ components/
│  ├─ ui/                   Primitives (Button, Card, Input, Stepper, Sheet, ...)
│  └─ features/             Domain components (TaskCard, FriendRow, RankRow, ...)
├─ lib/
│  ├─ types.ts              Domain types
│  ├─ seed.ts               Seeded mock data
│  ├─ leagues.ts            XP → league mapping
│  ├─ stores/               Zustand stores (auth, tasks, profile, friends, leaderboard)
│  └─ utils/format.ts       XP, dates, initials, avatar colors

assets/                     Static images extracted from the .fig
├─ coffee-cup.png            Hero / avatar
├─ icon.png / splash.png     Placeholder app icon + splash
└─ oauth/                    Google, Notion, OneNote logos
```

## Design tokens

The Figma uses Figma's *Simple Design System* (SDS). The tokens map directly to `src/theme/`:

| Figma                          | Code                                  |
|--------------------------------|---------------------------------------|
| `Brand/100` … `Brand/800`      | `palette.brand.{100…800}` (coffee)    |
| `Gray/900`                     | `palette.gray[900]` (#1E1E1E)         |
| `Background/Brand/Default`     | `colors.brandSurface`                 |
| `Icon/Default/Default`         | `colors.icon`                         |
| Inter Regular/Medium/SemiBold  | `fontFamily.{regular,medium,semibold}` |

Typography presets (`typography.titleLg`, `body`, etc.) are exposed via the `<Text variant>` prop so you never re-define a font style at a callsite.

## Mock data layer

State lives in small, focused Zustand stores. Each store wraps a seeded data set and exposes the minimum API a screen needs. To swap the mock for a real backend, replace the body of each store action — the screens stay untouched.

```ts
// Example: lib/stores/tasks.ts
const { add, toggleComplete, reschedule } = useTasks();
```

## Implementation notes & decisions

- **Bottom tab with a centered `+`** — implemented with a custom `tabBarButton` that intercepts the press, plays a haptic, and pushes `/new-task` as a modal. The `new-task-placeholder` tab route exists only because Expo Router requires a file per tab — it redirects on direct visit.
- **XP economy** — completing a task adds its XP to the profile; un-checking refunds it. League is recomputed on each XP change (`leagueFor()`).
- **Missed tasks** — derived from due date < now and `status !== 'completed'`. The reschedule action defaults to +24h.
- **Date picker** — inline horizontal scroller of the next 14 days + 5 hour presets. Chosen to avoid a native datetime-picker dependency for the prototype while still being a fast input pattern.
- **Settings sheet** — bottom sheet with display-name edit and a sign-out flow that returns to `/sign-in`.
- **Accessibility** — every interactive element has `accessibilityRole` and either visible text or `accessibilityLabel`. `Pressable` hitSlop is set on icon buttons.

## States covered

| State        | Where                                                |
|--------------|------------------------------------------------------|
| Loading      | Home shows `Skeleton` cards on first focus           |
| Empty        | `EmptyState` on Home (no tasks) and Friends (no match) |
| Error        | `ErrorState` available; not currently triggered by mock |
| Pressed      | Every Pressable has a pressed style                  |
| Disabled     | Buttons, Stepper, ProviderButton dim when disabled   |

## Open questions for future iteration

1. **Notion / OneNote as sign-in providers** is unusual. Likely better as *integrations* (sync notes/tasks). Currently they short-circuit to a mock auth.
2. **Friend Requests** UI was implied but not designed — built an inline accept/decline card.
3. **Leaderboard tabs beyond Weekly** — added an All-time tab; Daily / Monthly are easy extensions.
4. **Settings** is a stub — destinations for Notifications, Privacy, and Delete account aren't designed yet.
5. **Real auth + backend** — drop in Supabase / Clerk / Firebase by replacing the store bodies.

## Type check

```bash
npm run type-check
```

## Worth knowing

- The seed data drives every screen. If you want to demo a flow (e.g. an empty Home), tweak `src/lib/seed.ts`.
- The center `+` works on web too, just without haptics.
- Bundled OAuth logos came from the `.fig` archive — replace with vector versions before shipping.
