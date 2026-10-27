# React Task Board

[![ci](https://github.com/Lekopien/react-task-board/actions/workflows/ci.yml/badge.svg)](https://github.com/Lekopien/react-task-board/actions/workflows/ci.yml)

**Live demo: https://tasks.lekopien.com**

A drag-and-drop kanban board built with **React 19, TypeScript and Vite**. Tasks persist in the browser, so it works with no backend and no account.

## Features

- Three columns (To do, In progress, Done) with native HTML5 drag-and-drop, including dropping a card *before* another card.
- Touch and keyboard friendly: every card also has a "move to" menu.
- Add, rename (double-click), delete and clear completed tasks.
- Priorities with colour coding, live search and a priority filter.
- Progress ring showing the share of completed tasks.
- State saved to `localStorage` through a custom `usePersistentBoard` hook; it keeps working in private mode.
- Light and dark themes that follow the system setting.

## Architecture

All board changes go through one **pure reducer** (`src/board.ts`), so the logic is unit tested without rendering anything:

```ts
dispatch({ type: "move", id: "card-1", status: "done", beforeId: "card-7" });
```

| File | Role |
| --- | --- |
| `src/board.ts` | Types, reducer, filter and progress helpers |
| `src/board.test.ts` | Vitest tests for the reducer and helpers |
| `src/useLocalStorage.ts` | `useReducer` that persists to `localStorage` |
| `src/App.tsx` | UI: toolbar, columns, cards |

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # vitest
npm run build    # type-check + production build in dist/
```

## Deploy (free)

Cloudflare Workers serves `dist/` with SPA routing (`wrangler.jsonc`). In **Cloudflare → Workers & Pages → Create → Import a repository**, pick this repo and set the build command to `npm run build`. It deploys to `tasks.lekopien.com` on every push.

## License

MIT

## Author

Built by **David Lekopien** ([@Lekopien](https://github.com/Lekopien)) · [lekopien.com](https://lekopien.com)
