# instructions for AI Agents

Welcome to **runts**, a high-performance playground for TypeScript/React snippets powered by WebContainers.

## Tech Stack
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/vite`)
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **Runtime**: WebContainer API (executing code in the browser)
- **State Management**: Zustand
- **Testing**: Vitest with Browser Mode (Playwright)

## Core Architecture
The application is designed to provide a "local-like" development experience in the browser. 
- `src/store/useStore.ts`: Central state for files, terminal output, and WebContainer status.
- `src/components/Editor.tsx`: Monaco editor integration.
- `src/components/Preview.tsx`: Iframe/Preview for the running application.
- `src/components/Sidebar.tsx`: Controls for running, installing packages, and settings.

## Key Instructions for Agents
1. **WebContainer Lifecycle**: Always check if the WebContainer is booted before attempting to run commands. Use the store's `instance` and `status`.
2. **File System**: The WebContainer file system should stay in sync with the `files` array in the store.
3. **Tailwind 4**: We are using the new Vite plugin for Tailwind 4. Avoid using `tailwind.config.js` unless explicitly necessary; use CSS variables and `@theme` blocks in CSS files.
4. **Testing**: 
   - Use `npm run test` for standard Vitest runs.
   - Use `npm run test:browser` for browser-based tests.
   - Component tests are located in `src/components/__tests__`.
5. **Performance**: Monaco and WebContainers are heavy. Ensure components are memoized where appropriate and avoid unnecessary re-renders of the editor.

## Development Commands
- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run test`: Run tests.
- `npm run lint`: Run linting.
