# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

No build step. Open `dungeonworld2tool/gm_dashboard.html` directly in any modern browser. All dependencies (React 18, Babel, Tailwind) load from CDN.

## Architecture

This is a **single-file React app** — the entire application lives in `gm_dashboard.html` (~1360 lines). React/JSX is transpiled in-browser by Babel Standalone. No npm, no bundler, no server.

### State Management

Uses `useReducer` with a single centralized reducer. All state lives in one object:
- `campaigns[]` — per-campaign data (characters, session notes, XP checklist, random tables)
- `activeCampaignId` — currently selected campaign
- `factions[]` / `npcs[]` — **global**, shared across all campaigns

State auto-saves to `localStorage` key `gm_dashboard_v2` with a 2.5s debounce. A migration path exists from `gm_dashboard_v1`.

### Code Organization (within gm_dashboard.html)

The file is organized top-to-bottom in this order:
1. Utilities (`uid`, stat modifiers, random picker)
2. Blank state templates (shapes for new campaigns, characters, NPCs, factions)
3. `loadState()` / `makeFreshState()` with v1→v2 migration
4. Reducer with all action types
5. Static data (GM Moves, magic tables, XP questions, NPC name tables)
6. Shared UI components (`Btn`, `Field`, `Section`, `TagList`, `HPTracker`, `StatsBlock`, etc.)
7. Tab components (`CharactersTab`, `QuickReferenceTab`, `NPCFactionsTab`, `SessionTab`)
8. Session modules (`DiceRollerModule`, `RandomTablesModule`, `NPCGeneratorModule`)
9. `CampaignBar`, `Header`, `TabBar`, root `App`

### Reducer Action Namespaces

- Campaign: `ADD_CAMPAIGN`, `SWITCH_CAMPAIGN`, `DEL_CAMPAIGN`, `RENAME_CAMPAIGN`
- Character (campaign-scoped): `ADD_CHAR`, `UPD_CHAR`, `DEL_CHAR`
- Faction (global): `ADD_FAC`, `UPD_FAC`, `DEL_FAC`
- NPC (global): `ADD_NPC`, `ADD_NPC_WITH_DATA`, `UPD_NPC`, `DEL_NPC`
- Session (campaign-scoped): `SET_NOTES`, `TOGGLE_XP`, `RESET_XP`
- Random Tables (campaign-scoped): `ADD_TABLE`, `UPD_TABLE`, `DEL_TABLE`

### Styling

Tailwind CSS via CDN + inline styles where needed. Dark theme with amber accent `#f59e0b`.

## Key Design Constraints

- **Single file only** — all code stays in `gm_dashboard.html`. Do not split into multiple files.
- **No build tooling** — do not introduce npm, webpack, vite, or any bundler.
- **CDN dependencies only** — do not add local JS/CSS files.
- **localStorage is the only persistence** — no backend, no IndexedDB, no file system APIs.
