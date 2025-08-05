# **PR Title:**

`feat: add table loading state with shimmer effects and refactor UI logic for filtering`

# **Description:**

This PR implements a comprehensive loading state system with shimmer effects for tables and refactors the UI logic for filtering to provide a smoother, more professional user experience without page jumps or data wiping out.

# **What did you do?**

- **Table Loading State Implementation**: Created a new `TableShimmer` component with configurable shimmer effects
- **Enhanced BasicTableOne Component**: Added `loading` prop to show shimmer during data loading states
- **Improved Filter Logic**: Refactored `TableFilters` component with conditional filter button display
- **Smooth UX**: Implemented loading states that prevent page jumps and maintain layout consistency
- **Dark Mode Support**: Ensured all shimmer effects work seamlessly in both light and dark themes
- **Files Modified/Added**:
  - `src/components/common/TableShimmer.tsx` - New shimmer loading component
  - `src/components/tables/BasicTables/BasicTableOne.tsx` - Added loading prop and conditional rendering
  - `src/components/common/TableFilters.tsx` - Refactored filter button logic with showFilters state
  - `LOADING_EXAMPLE.md` - Documentation for loading state implementation

# **Problem Solved**

The application previously had jarring loading experiences where data would disappear during loading states, causing page jumps and poor user experience. This implementation provides:

- **Smooth Loading Experience**: Shimmer effects provide immediate visual feedback during loading
- **No Page Jumps**: Loading state maintains exact table layout to prevent layout shifts
- **Better Filter UX**: Conditional filter button that shows when multiple filters are available
- **Professional Appearance**: Consistent loading states across all table interactions
- **Improved Performance Perception**: Users see immediate feedback instead of blank states

# **Key Features Implemented**

## **TableShimmer Component**

- Configurable rows and columns for different table layouts
- Avatar support for first column with proper sizing
- Action column support with appropriate styling
- Dark mode compatible shimmer effects
- Smooth pulse animation using Tailwind's `animate-pulse`

## **Enhanced BasicTableOne**

- New `loading?: boolean` prop for controlling loading state
- Conditional rendering: shows shimmer when loading, actual table when not
- Maintains all existing functionality while adding loading capability
- Preserves table structure during loading to prevent layout shifts

## **Refactored TableFilters**

- Smart filter button that appears when `totalFilterCount > 1`
- `showFilters` state to control filter visibility
- Improved filter count calculation including search, filters, and active filters
- Better UX with "Filters" button that reveals individual filter options

# **Loading States Covered**

- **Initial Load**: Component mount and data fetching
- **Pagination**: Page changes and new data loading
- **Filtering**: When applying filters and data is being filtered
- **Search**: When searching and results are being updated
- **API Calls**: Any async operations that affect table data

# **Types of changes**

- [x] Bug fix (non-breaking change which fixes an issue)
- [x] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Chore (changes that do not relate to a fix or feature and don't modify src or test files)

# **Check List**

- [x] My code follows the code style of this project.
- [x] This PR does not contain plagiarized content.
- [x] The title and description of the PR are clear and explain the approach.
- [x] I am making a pull request against the **main branch**
- [x] My commit message style matches our requested structure.
- [x] My code additions will not fail code linting checks or unit tests.
- [x] I am only making changes to files I was requested to.

---

# **Deployment Status**

✅ **Successfully deployed to:**

- Netlify: [Deploy Preview](https://deploy-preview-17--agency-safulpay.netlify.app)
- Vercel: [Preview](https://agency-safulpay-git-temp-push-lawal-oyinlolas-projects.vercel.app)

**Build Status:** ✅ All checks passed (4/4)

**Files Changed:** 13 files with +444 additions, -317 deletions

---
