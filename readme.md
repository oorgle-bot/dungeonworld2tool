# 🗡️ The Great Undoing — GM Dashboard

A single-file, browser-based Game Master dashboard built for **Dungeon World 2** (DW2) campaigns. No server, no login, no dependencies to install — just open the HTML file and run a session.

---

## Features

### Campaign Management
- Create and manage multiple named campaigns
- Switch between campaigns via a dropdown in the top bar
- Rename or delete campaigns on the fly
- Each campaign maintains its own characters, session notes, XP checklist, and random tables

### Characters Tab
Full player character sheets with:
- **Identity** — name, race, class/playbook, player name, level
- **Stats** — STR/DEX/CON/INT/WIS/CHA with auto-calculated modifiers
- **HP & Combat** — current/max HP bar with color-coded health states, armor value
- **Status Effects** — tag-based tracker for conditions
- **XP & Advancement** — XP counter, class path, advancement log
- **Moves** — tag list of known moves
- **Equipment** — item list with weight tracking
- **Description & Origins** — backstory and appearance freetext
- **Bonds** — freetext bond log
- **PC Relationships** — per-character notes on relationships with other PCs in the campaign
- **Faction Standing** — sliders from Hostile (−3) to Allied (+3) for each defined faction
- **Story Beats Log** — timestamped event log for each character's narrative arc
- **GM Notes** — private notes field (purple border as a visual reminder)

### Quick Reference Tab
At-a-glance rules reference covering:
- GM Moves list with highlight toggle for "hard moves"
- Magic roll results for 7–9 and Miss outcomes
- Stat modifier reference table

### NPCs & Factions Tab
- Create and edit **Factions** with name, leader, base, agenda, and a heat tracker (pip-style, 0–5)
- Create and edit **NPCs** with name, faction affiliation, role, hook, and secret
- NPCs and Factions are **global** (shared across all campaigns)

### Session Tab
- **Session Notes** — freetext area for in-session notes
- **XP Checklist** — end-of-session questions (DW2 standard) with reset button
- **Prep Prompts** — randomly surfaced GM prep reminders
- **Modular In-Session Tools** — add/remove/reorder tool panels:
  - 🎲 **Dice Roller** — roll any die (d4 through d20 + custom), with roll history
  - 📋 **Random Tables** — create custom tables with entries, roll from them in-session
  - 🧑 **NPC Generator** — one-click random NPC with name, role, and hook; auto-adds to NPC list
  - 🎙️ **Voice Recap** *(coming soon)* — placeholder for a future voice-based session recap feature

---

## Persistence

All data is saved to **`localStorage`** under the key `gm_dashboard_v2`. The app auto-saves 2.5 seconds after any change, and a manual **💾 Save** button is available in the header. The last-saved time is displayed next to the save button.

A migration path exists from the previous `gm_dashboard_v1` storage schema.

> **Note:** Data is browser- and device-specific. Clearing browser storage will erase all campaign data. For backup, copy the raw localStorage value or export via browser dev tools.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 (via CDN, UMD build) |
| Styling | Tailwind CSS (via CDN) + inline styles |
| Transpilation | Babel Standalone (in-browser JSX) |
| State | React `useReducer` |
| Storage | Browser `localStorage` |
| Build tooling | None — single `.html` file |

---

## Getting Started

1. Download `gm_dashboard.html`
2. Open it in any modern browser (Chrome, Firefox, Edge, Safari)
3. That's it

No `npm install`. No build step. No internet connection required after the initial CDN load.

---

## File Structure

Everything lives in a single HTML file, organized into logical sections:

```
gm_dashboard.html
├── Utilities & constants
├── State shape (blank templates)
├── loadState / makeFreshState (localStorage init + v1 migration)
├── Reducer (all state transitions)
├── Static data (GM Moves, Magic results, XP questions, NPC gen tables)
├── Shared UI components (Btn, Field, Section, TagList, StatsBlock, HPTracker, etc.)
├── Tab components
│   ├── CharactersTab + PCDetail
│   ├── QuickReferenceTab
│   ├── NPCFactionsTab
│   └── SessionTab (+ Module system)
├── Session modules (DiceRollerModule, RandomTablesModule, NPCGeneratorModule, VoiceRecapModule)
├── CampaignBar
├── Header
├── TabBar
└── App (root)
```

---

## Roadmap / Known Gaps

- [ ] Voice Recap module (currently disabled/placeholder)
- [ ] Export/import campaign data as JSON
- [ ] Print-friendly character sheet view
- [ ] Player-facing view (hides GM Notes fields)
- [ ] Mobile layout polish

---

## License

Personal/hobbyist use. Not affiliated with Sage LaTorra, Adam Koebel, or the official Dungeon World IP.
