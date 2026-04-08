# /review-animation — Audit Animation Code

When I run /review-animation on a file or component, check:

1. Is react-native-reanimated used exclusively? (no Animated API)
2. Are all timing values using TIMING constants from constants/animations.ts?
3. Does every animation have a corresponding haptic call?
4. Is the snap animation sequence intact and in the right order?
5. Are shared values declared with useSharedValue (not useState)?
6. Are style objects created with useAnimatedStyle?
7. Is runOnJS used for any callbacks that update React state?
8. Are withSpring / withTiming configs using SPRINGS constants?

Report: list of issues with file + line number + suggested fix.