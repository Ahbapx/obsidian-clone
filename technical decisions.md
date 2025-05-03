# Technical Decisions for NoteVault (Obsidian Clone)

## 1. Architecture & Framework

- **Framework:** Next.js (App Router, TypeScript)
- **Component Structure:** Modular, colocated in `components/` with further organization into `ui/` for reusable primitives.
- **State Management:** Primarily React hooks and custom hooks (e.g., `useLocalStorage`, `useHotkeys`, `useSettings`).
- **Persistence:** LocalStorage for notes, folders, and tags (no backend by default).
- **Styling:** Tailwind CSS with custom theme tokens and dark mode support via `next-themes`.
- **AI Integration:** AI Assistant (mocked by default, expects `GOOGLE_AI_API_KEY` for real use).
- **Type Safety:** TypeScript throughout, with strict mode enabled.
- **UI Library:** Heavy use of Radix UI primitives and custom UI components.

## 2. Practical Decisions

- **No Backend:** All data is stored in browser localStorage for simplicity and privacy.
- **AI Assistant:** Integrated but runs in mock mode unless API key is provided.
- **Keyboard Shortcuts:** Implemented via custom hooks for productivity (e.g., Ctrl+N, Ctrl+P, Ctrl+S, etc.).
- **Command Palette:** CMDK-based command menu for quick actions and navigation.
- **Tabs & Sidebar:** Multi-note tabs and hierarchical sidebar for navigation, inspired by Obsidian.
- **Markdown Support:** Uses CodeMirror for editing and `react-markdown` for preview.
- **Export/Import:** Export menu for note data, but no cloud sync.
- **Dialogs:** Settings, unsaved changes, and save location dialogs for UX clarity.

## 3. Style Preferences

- **Tailwind CSS:** All styling via Tailwind, with custom color tokens and utility classes.
- **Dark Mode:** Default theme is dark, but system and user toggle supported.
- **Consistent Spacing:** Uses Tailwind spacing and border radius tokens for uniformity.
- **Component Variants:** Uses `class-variance-authority` for button and UI variants.
- **Minimal Custom CSS:** Most styles are in Tailwind, with a few custom utility classes (e.g., `.text-balance`).
- **SVG Icons:** Uses Lucide React for iconography.

## 4. Syntax Preferences

- **TypeScript:** All files use TypeScript or TSX, with strict type checking.
- **Functional Components:** All components are functional, with hooks for state/effects.
- **Props Typing:** All props are explicitly typed, often with interfaces.
- **ForwardRef:** Used for UI primitives to support composition and accessibility.
- **Destructuring:** Props and state are destructured for clarity.
- **Hooks:** Custom hooks are used for cross-cutting concerns (localStorage, hotkeys, settings, etc.).
- **Imports:** Absolute imports via `@/` alias (configured in `tsconfig.json`).
- **Client/Server Components:** Uses Next.js `"use client"` directive for client-only components.
- **No Class Components:** Only functional components are used.

## 5. Tooling & Dependencies

- **Next.js 15+**
- **React 19+**
- **Tailwind CSS 3+**
- **Radix UI** for accessible primitives
- **CMDK** for command palette
- **CodeMirror** for markdown editing
- **Lucide React** for icons
- **Zod** for schema validation (potentially in forms)
- **date-fns** for date handling
- **Sonner** for toasts/notifications
- **Classnames:** `clsx` and `tailwind-merge` for class composition
- **Package Manager:** Uses `npm` for fast, efficient dependency management.

## 6. Coding Conventions

- **File Naming:** Kebab-case for files, PascalCase for components.
- **Exports:** Named exports for components, default export for main layout/page.
- **Hooks:** Always prefixed with `use` and placed in `hooks/`.
- **Types:** Centralized in `lib/types.ts`.
- **Utils:** Centralized in `lib/utils.ts`.
- **No Magic Numbers:** Uses theme tokens and constants where possible.
- **Accessibility:** Focus-visible, aria attributes, and keyboard navigation considered in UI.

## 7. Miscellaneous

- **No Server-Side Rendering for Notes:** All note data is client-side only.
- **No Authentication:** App is single-user, local only.
- **No Analytics/Tracking:** No external tracking or analytics by default.
- **Open to Extension:** Structure allows for future backend, sync, or plugin support.

---

_Last updated: 2024-06-09_
