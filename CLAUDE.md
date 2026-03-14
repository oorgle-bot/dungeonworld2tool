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

## Architectural Patterns

**Read `architectural_patterns.md` before adding any new feature.** It documents recurring patterns with exact line references:

- `updAC` helper for campaign-scoped mutations (never mutate directly)
- Template factory functions (`newChar`, `newNPC`, etc.) — always use these, not inline literals
- Tab-local UI state vs. reducer state (only persist-across-reload data goes in reducer)
- `useEffect` campaign-switch reset for tabs holding a selected entity ID
- Dropdown overlay pattern for click-away dismissal
- `{ id, patch }` dispatch convention for all `UPD_*` actions (send only changed fields)
- `TagList` component for all tag-style inputs
- Color palette constants (dark bg `#0f172a`, panel `#070f1c`, input `#1f2937`, border `#374151`, amber `#f59e0b`, success `#10b981`, danger `#ef4444`)
- Conditional ternary inline styles (not CSS classes) for state-dependent colors
- Debounced auto-save via `useRef` timer — do not add secondary persistence


## Adding New Features or Fixing Bugs

**IMPORTANT**: When you work on a new feature or bug, create a girt branch first. Then work on changes in that branch for the remainder of the session.

## Key Design Constraints


- **localStorage is the only persistence** — no backend, no IndexedDB, no file system APIs. This can be improved in the future, but needs to be fully defined and understood before expanding.


## Known Gaps / Roadmap

- Voice Recap module (placeholder exists, currently disabled)
- Export/import campaign data as JSON
- Print-friendly character sheet view
- Player-facing view (hides GM Notes fields)
- Mobile layout polish
