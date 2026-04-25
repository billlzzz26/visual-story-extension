# Bolt's Journal - Critical Learnings

## 2025-05-19 - [String Concatenation in Loops]
**Learning:** Found that several exporters and utility functions were using `+=` for string concatenation in loops. While JS engines optimize this, for very large outputs (thousands of entities), this can lead to $O(N^2)$ performance due to repeated string allocations and copies.
**Action:** Use an array to collect segments and `join('')` at the end for large-scale string construction.

## 2025-05-19 - [Redundant Sorting in Exporters]
**Learning:** `toMermaid` and `toMarkdown` exporters were performing redundant filtering and sorting of events by act/sequence.
**Action:** Sort the events array once at the beginning of the exporter and iterate through the sorted list, detecting act changes if necessary.
