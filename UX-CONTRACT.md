# UX Contract

## Product context
Personal BIOL 2401 study tool, English UI for a US college student. User authorized merging, redesign, and subsequent public GitHub publication on 2026-10-08. Accessibility baseline: semantic controls, visible keyboard focus, responsive reflow and reduced-motion support; this is not a claim of formal WCAG certification.

## Business-context sources
| Scope | Source | Authority |
|---|---|---|
| Scope and permissions | User instruction 2026-10-08; docs/visual-study-beta-execution-note.md | User |
| Course content | src/data/studyData.js; src/data/bonesLabChapter7.js; existing chapter packs | Preserved implementation evidence; exam scope belongs to instructor |
| Anatomy provenance | public/human-atlas/ATTRIBUTION.md; HUMAN_ATLAS_BUILD.md; vendor/human-atlas/README.md | Shipped licenses and upstream source |
| Data lifecycle | src/hooks/useLocalStorage.js; src/lib/studyBackup.js | Local persistence implementation |
| Import validation | src/lib/chapterImport.js | Runtime validation |
| Billing/auth/server | None | Not applicable: local static application |

## Visual contract
DESIGN.md mirrors canonical src/index.css. Shared shell, controls, sources and scrollbars are CSS-owned; genuine atlas internals remain upstream-owned. English UI; light by default with an explicit saved dark-mode toggle. Verify changed runtime tokens and docs together.

## Canonical UI Map
| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Navigation | App.jsx / Sidebar.jsx | Shared navigation array | Sidebar, mobile disclosure | Page and narrow viewport |
| Select/Listbox | Native select | .field, per-view labelled controls | Platform popup intentionally accepted | Keyboard and mobile |
| Form | ChapterImportView / BackupPanel | chapterImport.js / studyBackup.js | noValidate, file picker, preview | Invalid file, save, cancel |
| Search | ChaptersView / HumanBodyView | Local filtering | Explicit Clear | No-results and reset |
| Toast | Inline status / alert | role=status / role=alert | Durable in-page feedback | Success/error |
| Scrollbar | src/index.css / atlas globals.css | Global scrollbar baseline | Desktop companion bounded, page natural | Computed style |
| CRUD | App.jsx / BackupPanel | Local chapter/notebook state | Preview save, undo remove/replace | Full round trip |
| Atlas | HumanBodyView / upstream page.tsx | Same-origin bridge | Genuine iframe exploration | Explore, isolate, explode, recall |
| Theme | App.jsx / src/index.css | Saved study-buddy-theme preference | Light default, explicit dark; atlas sync | Toggle, reload, all pages and phone |
| Progress | App.jsx / practice.js | Completed attempts | Local storage and backup | Reload/restore |


## Dataset navigation
Chapter/card filters are local and reset when leaving their page; selected chapter and active page persist. No URL/router contract is implied by the existing one-page app. Atlas search shows at most 12 relevant results in companion; its genuine search provides finer catalogue navigation. TXT, Markdown, PDF, and PPTX imports preserve readable source text as notes only until authored questions/cards are supplied. Scanned PDFs need OCR before import. Course and supplemental practice never mix implicitly.

## Flow ledger
| Operation | Success | Failure/recovery | Source |
|---|---|---|---|
| Import notes/pack | Preview then save; open library | Inline schema error, choose another file | chapterImport.js |
| Update same imported chapter | Replace same namespaced ID, preserve built-in data | Undo previous import | App.jsx |
| Remove imported chapter | Remove locally | Undo while panel session remains | App.jsx |
| Backup | Versioned JSON download | Inline error | studyBackup.js |
| Restore | Preview, explicit Replace; data restored | Reject malformed/future file; cancel/undo | BackupPanel.jsx |
| Practice | Save real score/misses; retry missed | Empty pool disabled, source/chapter switch | PracticeArcade.jsx |
| Atlas selection | Highlight/isolate genuine geometry; save notes | Model/catalogue error and reload | HumanBodyView.jsx |
| Visual identification | Atlas names only, supplemental; guided reveal recorded as miss | Wrong response gives reveal/retry | atlasLearning.js |
| Local saving | Browser storage update | Keep in-memory changes and expose backup prompt on failure | useLocalStorage.js |

## Navigation and responsive behavior
Each page sets document.title. Unsupported legacy viewer routes map to anatomy studio; the SVG route is removed, its course drills and progress remain in Bone landmarks. Course click-bone practice uses the genuine atlas with 32 precisely mapped targets; five overview concepts stay available in text practice because they have no exact mesh target. Mobile menu is nonmodal; it closes when a destination is chosen. Print guide hides shell/actions and includes checking notes.

## Data and source safety
No app backend, uploads to external services, sign-in, billing, or account service. Public GitHub publication is authorized; website deployment is outside this handoff. User-imported source classification is explicit, not inferred. Built-in material is described as course-based, never guaranteed verbatim textbook or guaranteed exam coverage. Atlas information is reference material and attribution is retained. Backups preserve imported content, original progress, notebook and source metadata. Reset clears learning state and the anatomy notebook while preserving imports and theme; Undo lasts for the current panel session, and exporting provides durable recovery.
