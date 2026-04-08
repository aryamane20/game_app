# /deploy — Build and Deploy Checklist

When I run /deploy, walk me through this checklist in order:

## Pre-build checks
- [ ] All console.log removed from production code
- [ ] No hardcoded test data or mock levels
- [ ] AsyncStorage keys use APP_VERSION prefix (prevents stale data)
- [ ] expo-haptics calls wrapped in try/catch (some simulators throw)
- [ ] Daily knot array has entries for next 30 days minimum
- [ ] app.json version number bumped

## Build commands
For TestFlight (iOS):
`eas build --platform ios --profile preview`

For Play Store internal testing:
`eas build --platform android --profile preview`

For production:
`eas build --platform all --profile production`

## Post-build
- [ ] Test snap animation on physical device (not simulator)
- [ ] Test haptics on physical device
- [ ] Test Daily Knot streak logic across a date boundary
- [ ] Screenshot set updated in App Store Connect