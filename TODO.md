# Aramco Brand Colors Implementation Plan

## Information Gathered
- The app uses Material-UI (MUI) with a custom theme defined in `src/index.js`.
- Colors are applied via MUI's `sx` props, theme palette, and some hardcoded hex values.
- Current theme has default primary (#1976d2) and secondary (#dc004e) colors.
- Hardcoded colors found: #1976d2 (blue), #ffd600 (yellow), #e0e7ff, #f5f6fa, etc.
- StarRating component uses 'gold' and 'gray' for stars.

## Plan
1. Update MUI theme in `src/index.js` to include Aramco color palette
2. Replace hardcoded colors in component files with theme colors
3. Update StarRating component to use specified star colors (#FBBF24 and #D1D5DB)
4. Update gradient backgrounds to use Aramco colors
5. Ensure all color usages align with the provided guidelines

## Dependent Files to be Edited
- `src/index.js` - Update theme palette
- `src/components/StarRating.js` - Update star colors
- `src/pages/Home.js` - Replace hardcoded colors
- `src/pages/Login.js` - Replace gradient and colors
- `src/pages/Review.js` - Replace gradient and colors
- `src/pages/Reward.js` - Replace gradient and colors
- `src/pages/MyRewards.js` - Replace gradient and colors
- `src/pages/RewardSearch.js` - Replace gradient and colors
- `src/pages/RewardScan.js` - Update button colors if needed

## Followup Steps
- Test the application to ensure colors render correctly
- Verify accessibility contrast ratios
- Check for any remaining hardcoded colors
