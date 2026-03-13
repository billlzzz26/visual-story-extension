## 2025-05-15 - [Consolidated validation passes]
**Learning:** Found that `validateGraph` was performing multiple iterations over the `graph.events` array to calculate act counts, check for climax/midpoint presence, and other structural checks.
**Action:** Consolidated these checks into a single `for...of` loop to reduce complexity from O(kN) to O(N), which provides a measurable performance boost as the story size increases.
