# Execution Note — 3D Skeleton Viewer Integration

## Context

Ported the stable minimal 3D skeleton viewer from the sandbox repo
(`study-buddy-3d-skeleton-local`) into the real Amelia app. The sandbox
was used to select `skeleton1.glb` (183 individually segmented bone meshes)
over `skeleton2.glb` (14 region-grouped meshes, unsuitable for bone-level
interaction), diagnose and fix camera auto-fit, and isolate a post-render
white-box crash caused by React StrictMode + R3F Canvas lifecycle conflicts.

Only the stable minimal rendering foundation is ported. Advanced features
(bone click/select, labels, color highlighting, quiz target, region focus)
are intentionally deferred until the base proves stable inside the real app.

## Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modified | Added `three`, `@react-three/fiber`, `@react-three/drei` |
| `public/models/skeleton.glb` | Created (16.3 MB) | The chosen GLB asset (skeleton1.glb, 183 bone meshes) |
| `src/components/Skeleton3DView.jsx` | Created | Minimal 3D viewer: GLB load, auto-fit camera, orbit controls |
| `src/components/Sidebar.jsx` | Modified | Added `overflow-y-auto` to nav to make it scrollable |
| `src/App.jsx` | Modified | Added "3D Skeleton" nav item + section rendering + imports |
| `src/main.jsx` | Modified | Removed `<StrictMode>` (causes WebGL context destruction on remount) |
| `docs/skeleton-3d-integration-note.md` | Created | This file |

## Bug: Nav item invisible due to sidebar overflow

The sidebar `<aside>` has `overflow-hidden` and fixed height `calc(100vh-3rem)`.
With the header, progress card, 10 nav items, and footer, the nav section overflows.
The "3D Skeleton" item (position 6) was rendered but clipped below the visible area.

Fix: Added `overflow-y-auto` to the `<nav>` element in Sidebar.jsx so it scrolls
when content exceeds available space. This also fixes the pre-existing issue where
the bottom nav items (Cram Mode, Course Sync) were clipped on shorter screens.

## What Works

- "3D Skeleton" appears in the sidebar navigation
- Clicking it loads and renders the 183-bone GLB model
- Camera auto-fits to the model's world-space bounding box
- Orbit (drag to rotate) and zoom (scroll) work via OrbitControls
- The skeleton remains stably visible (no white-box crash)
- The viewer panel matches the app's existing glassmorphism design
- All other app sections remain functional and unchanged

## What Is Intentionally Not Restored Yet

- Bone click/select with highlighting
- Study panel (bone info on click)
- Per-bone material cloning and dynamic recoloring
- Labels overlay (Html components from Drei)
- Region focus dimming
- Quiz mode bone highlighting
- Hover cursor change
- Bone mapping data (boneMapping.js not yet ported)

These features were stripped during the sandbox isolation pass to find the
white-box crash root cause. They should be re-added one at a time, testing
stability after each, once the base viewer is confirmed stable in the real app.

## StrictMode Note

React `<StrictMode>` was removed from `main.jsx`. This is development-only
(no production impact). StrictMode forces mount → unmount → remount of all
components in dev mode. R3F's Canvas creates/destroys WebGL contexts during
this cycle, and the remount path fails silently, producing a white box.

This is a known friction point between React StrictMode and WebGL-based
libraries. The fix is safe: StrictMode has zero effect on production builds.

## Test Commands

```
cd "C:\Users\rayta\OneDrive\Desktop\Amelia's Study Buddy APP"
npm run dev
# Open http://localhost:5173/
# Click "3D Skeleton" in the sidebar
# Verify: skeleton visible, orbit works, zoom works, no white box
```
