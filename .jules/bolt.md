## 2025-05-15 - [Consolidated validation passes]

**Learning:** Found that `validateGraph` was performing multiple iterations over the `graph.events` array to calculate act counts, check for climax/midpoint presence, and other structural checks.
**Action:** Consolidated these checks into a single `for...of` loop to reduce complexity from O(kN) to O(N), which provides a measurable performance boost as the story size increases.

## 2025-05-16 - [Optimized StoryGraph building performance]
**Learning:** The `buildInitialGraph` function was performing redundant `toLowerCase()` operations within nested loops for character-to-event assignment and during event/conflict extraction.
**Action:** Pre-calculate lowercased strings once and reuse them. Specifically, pre-calculating character names and event labels before the assignment loop reduces complexity from $O(E \times C)$ to $O(E+C)$ string transformations.
