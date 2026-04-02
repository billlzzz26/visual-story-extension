## Summary

This PR converts the setup command from Conductor (software development workflow) to bl1nk (story writing workflow).

## Changes

### Core Changes
- Convert Conductor setup → bl1nk setup
- `product.md` → `story-universe.md`
- `product-guidelines.md` → `style-guidelines.md`
- `tech-stack.md` → `world-building.md`
- `code_styleguides/` → `character-guides/`
- `tracks/` → `books/`
- `spec.md` → `synopsis.md`
- `plan.md` → `outline.md`
- Development workflow → Writing workflow

### Additional Changes
- Add Code Review Issues section to TODO.md
- Fix test import paths (`server.js` → `index.js`)
- Update test assertions for better error messages
- Update tsconfig.json for env.d.ts support

## Code Review Issues Added

### High Priority
- [ ] Fix RegExp creation in nested loop (`analyzer.ts:149`)
- [ ] Add CSV escaping (`generate-artifacts.ts:60-77`)
- [ ] Lazy load templates (`search-entries.ts:24-27`)

### Medium Priority
- [ ] Move dynamic imports to static (`execute.ts:37-38`)
- [ ] Fix spread operator in loop (`search-entries.ts:149`)

### Low Priority
- [ ] Reconsider test exclusion in tsconfig
- [ ] Implement template compilation caching

## Testing

All existing tests pass with updated import paths.

## Related Issues

- TODO.md updated with code review findings
