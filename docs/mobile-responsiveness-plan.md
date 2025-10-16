# Mobile Responsiveness Improvement Plan

## Objectives
- Deliver a consistent, touch-friendly experience for dashboard, claims, and settings views across small (≤640px), medium (641–1024px), and large (>1024px) screens.
- Reduce horizontal scrolling and cramped layouts in navigation, summary cards, and drawers.
- Prioritize actionable quick wins for the existing layout before longer-term refactors.

## Current Pain Points
1. **Navigation crowding on narrow widths.** The header uses a fixed horizontal navigation with equal spacing for every item, causing wrapping/overflow on small screens.【F:src/components/DashboardLayout.tsx†L24-L64】
2. **Content container assumptions.** Pages rely on the `container` utility with wide padding that compresses the main content area on phones.【F:src/components/DashboardLayout.tsx†L52-L62】【F:src/pages/Index.tsx†L32-L72】
3. **Large summary blocks.** Dashboard sections render in stacked blocks with generous gaps (`space-y-8`) and multi-column content that lacks responsive breakpoints.【F:src/pages/Index.tsx†L32-L72】
4. **Drawer density.** Client and chat drawers open with desktop-sized layouts; on mobile they should expand full-screen with simplified controls.【F:src/pages/Index.tsx†L56-L72】

## Work Plan

### Phase 1 – Discovery & Quick Wins (1–2 days)
1. **Add mobile breakpoints to navigation.** Introduce a collapsed menu or icon-only state <640px using conditional rendering and Tailwind responsive classes in `DashboardLayout`.
2. **Tighten padding and spacing.** Adjust `container` padding and vertical spacing (`space-y-8`) to have smaller values on `sm` viewports.
3. **Verify component library defaults.** Confirm all shared UI components (`Button`, `Toaster`, drawers) respect `w-full` and `min-w-0` patterns to avoid overflow.
4. **Responsive typography audit.** Ensure header and card titles scale down (`text-2xl` on mobile) using Tailwind responsive type utilities.

### Phase 2 – Component-Level Enhancements (3–4 days)
1. **Navigation redesign.** Build a mobile navigation drawer or bottom tab bar for primary routes (`/`, `/claims`, `/settings/digest`).【F:src/components/DashboardLayout.tsx†L34-L51】
2. **Dashboard sections.**
   - Convert summary cards to a single-column stack on `sm` screens, two columns on `md`, and current layout on `lg`.
   - Replace fixed gaps with responsive utilities (`gap-4 sm:gap-6`).
   - Ensure charts and tables accept `className` overrides for width/height via props.
3. **Drawers.** Update `ClientDrawer` and `ChatDrawer` to use `max-w-full` on mobile, add close buttons in the header, and audit scroll behavior for long content.【F:src/pages/Index.tsx†L56-L72】
4. **Forms and tables.** Review claims/settings pages to ensure form controls stack vertically and tables offer horizontal scroll wrappers with sticky headers.

### Phase 3 – Testing & Validation (1–2 days)
1. **Manual device pass.** Test using browser dev tools presets (iPhone SE, Pixel 7, iPad) for major flows.
2. **Automated visual tests.** Capture Percy or Playwright screenshots at `360px`, `768px`, and `1280px` widths for regression tracking.
3. **Performance sanity check.** Use Lighthouse mobile runs to verify no layout shift or tap target warnings.

### Phase 4 – Documentation & Handoff (0.5 day)
1. Update the project README with responsive design guidelines and supported breakpoints.
2. Add Storybook or dedicated docs demonstrating responsive variants of key components.

## Dependencies & Risks
- Component updates may require coordination with design specs; allocate review time.
- Introducing mobile navigation can affect routing tests; ensure React Router links maintain active state.
- Drawer refactors must avoid breaking existing keyboard accessibility behavior.

## Success Criteria
- No horizontal scrolling on 360px width for primary pages.
- Navigation remains fully usable with 44px tap targets on touch devices.
- Drawers adapt to full-width mobile layout with accessible controls.
- Lighthouse mobile score ≥90 for accessibility and best practices.

