---
version: alpha
name: "Amelia's Study Buddy"
description: "An anatomy studio that turns visual exploration into course recall."
colors:
  primary: "#186C64"
  background: "#F4F6F5"
  surface: "#FFFFFF"
  ink: "#172E32"
  coral: "#E99A83"
  gold: "#D9BB76"
typography:
  sans:
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif'
  display:
    fontFamily: '"Space Grotesk", "Plus Jakarta Sans", sans-serif'
rounded:
  DEFAULT: "18px"
  control: "10px"
spacing:
  section-gap: "24px"
  sidebar: "238px"
components:
  button: {}
  card: {}
  input: {}
  navigation:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.coral}"
  studyPath:
    textColor: "{colors.gold}"
---

# Amelia's Study Buddy Design System

## Overview

### Creative North Star
A working anatomy studio: an illuminated specimen table beside a small field notebook.
The genuine Human Atlas, rather than decoration, is the memorable signature.

### Product context and register
- Audience: Amelia, a BIOL 2401 student who learns visually; user brief dated 2026-10-08.
- Primary jobs: see anatomy, retrieve course knowledge, rehearse exams, add missing course material.
- Market evidence: personal US college course; no commercial or Japan-market assumption.
- Locale: English UI, US course numbering; stored timestamps ISO UTC, displayed using the device locale.
- Product register: familiar study controls, expressive body workspace; no marketing in study tasks.
- Restraint: quiet chapter text, honest scores, modest animation. Avoid dashboard clutter, fake exam dates, generic glass cards.
- Token ownership: `src/index.css` is canonical. This document mirrors its six core palette tokens and spacing. Legacy course surfaces retain established semantic Tailwind colors; vendor anatomy colors encode systems and remain separate.
- Drift gate: review CSS against this file; strict skill audit and official design lint.

## Colors
Primary teal selects and acts. Deep ink anchors the sidebar and headings. Paper background and white surfaces keep reading legible. Coral marks the live studio; gold supports the study path. Errors/success also use established readable rose/emerald semantic styles. Focus uses primary on paper and coral in the dark sidebar. Light is the default and retains its existing palette. An explicit saved light/dark header toggle applies a dark teal background (#101B20), panel (#192A30), pale text (#E2ECE8), and readable muted text (#ADBFBC). Dark overrides live in src/index.css; the genuine atlas synchronizes its chrome and scene background without changing anatomical system colors. Print guides use paper colors in either mode. Forced-colors falls back to system colors.

## Typography
Space Grotesk for identity and headings, Plus Jakarta Sans for body and controls; system sans fallbacks work without network fonts. Strong weight and short labels clarify actions. Study prose uses generous line height and wraps; technical counts remain literal. No decorative serif, all-caps paragraphs, or oversized numerical dashboards.

## Layout
238px sidebar on desktop, compact 205px variant below 1200px. Below 1000px a persistent nonmodal navigation disclosure replaces it. Main content has natural document scrolling. Atlas workbench uses a flexible 3D canvas and a 270px companion, stacking below 700px. The companion scrolls internally on desktop; text forms and chapter pages stay natural height. All primary actions remain reachable at 320px.

## Elevation & Depth
Borders and tonal surfaces establish hierarchy; panels have only a faint shadow. No backdrop blur on new shell or panels. Atlas uses its genuine 3D illumination and existing overlay sheets.

## Shapes
18px panels, 10px buttons and fields, 5px source tags. Existing course subpanels retain their original rounded geometry. No decorative pill containers without a control or content purpose.

## Components

### Foundational visual states
Visible focus, pointer cursor, hover and pressed feedback; disabled controls cannot act. Loading uses text with bounded timeout and retry for the atlas. Async imports reserve their input geometry and show inline live feedback. Empty/no-results states explain a useful next action.

### Buttons and actions
Shared `.action` and `.action-secondary` distinguish primary from secondary choices; minimum 42px height. Icon buttons have accessible labels. Removals offer undo where content is changed. No browser confirmation dialogs.

### Navigation and data display
`Sidebar.jsx` owns desktop navigation and `App.jsx` the mobile equivalent, from one navigation array. Active item uses aria-current. Scores reflect completed attempts; staged recommendations are optional, never fabricated. Source tags separate course-based study material and supplemental anatomy.

### Forms and overlays
Shared `.field` wraps labels and native inputs/selects. Native select popup ownership is intentional on this small local study tool. Search has an explicit clear action. Forms use noValidate and inline validation. Textareas do not resize. Atlas uses the upstream Base UI sheets and controls; the study companion is nonmodal. The mobile navigation is an ordinary disclosure, not a modal.

### Iconography
Lucide, normally 16–20px, stroke icons with text on primary actions. Icons do not substitute for source labels.

### Motion
Short hover/press feedback; no required timed interactions. Reduced-motion disables owned CSS animation and smooth scrolling. Atlas auto-rotation is off by default and user-controlled.

## Do's and Don'ts
- Do keep the real anatomical body visible and useful.
- Do preserve original course facts and make new reference activities supplemental.
- Don't claim uploaded plain notes magically generate authoritative questions.
- Don't insert fake schedules, exam guarantees, or empty feature buttons.
