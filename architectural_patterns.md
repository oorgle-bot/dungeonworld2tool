# Architectural Patterns

Recurring design patterns found in `gm_dashboard.html`. Reference these before adding new features.

---

## 1. `updAC` Campaign Mutation Helper
**Location:** `gm_dashboard.html:141–145`

All campaign-scoped reducer cases use `updAC` to map over campaigns and patch only the active one. Never mutate campaign state directly.

```js
const updAC = fn => state.campaigns.map(c =>
  c.id === state.activeCampaignId ? fn(c) : c
);
```

---

## 2. Template Factory Functions
**Location:** `gm_dashboard.html:79–101`

`newChar()`, `newFaction()`, `newNPC()`, `newCampaign()` define canonical entity shapes. Always use these when creating new entities — not inline object literals — to keep shapes consistent.

---

## 3. Tab-Local UI State
Tabs manage selection/open state locally with `useState`. Only data that must survive a page reload goes through the reducer.

Examples:
- `selId` in `CharactersTab` — `gm_dashboard.html:597`
- `activeModules` / `pickerOpen` in `SessionTab` — `gm_dashboard.html:1088–1089`

---

## 4. Campaign-Switch Reset via `useEffect`
**Location:** `gm_dashboard.html:600–603`

When `activeCampaignId` changes, reset local selection state to prevent stale references.

```js
useEffect(() => { setSelId(null); }, [state.activeCampaignId]);
```

Apply this pattern in any tab that holds a selected-entity ID.

---

## 5. Dropdown Overlay Pattern
**Location:** `gm_dashboard.html:1226`, `1162`

A fixed full-screen `<div className="dropdown-overlay">` closes the dropdown on click-away. Used in `CampaignBar` and `SessionTab` module picker. Always pair a dropdown with this overlay.

---

## 6. `patch` Dispatch Convention
`UPD_CHAR`, `UPD_FAC`, `UPD_NPC`, `UPD_TABLE` all accept `{ id, patch }` and spread-merge: `{ ...entity, ...patch }`. Send only the fields that changed — never dispatch a full object replacement.

---

## 7. TagList Component Reuse
**Location:** `gm_dashboard.html:306–328`

`TagList` handles any list of string tags: add, remove, display. Used for status effects, advancements, moves, equipment, story beats, and random table entries. Use it for all new tag-style inputs.

---

## 8. Color Palette (inline, not extracted)
Use these values consistently in new inline styles:

| Role          | Value     |
|---------------|-----------|
| Dark bg       | `#0f172a` |
| Panel bg      | `#070f1c` |
| Input bg      | `#1f2937` |
| Border        | `#374151` |
| Amber accent  | `#f59e0b` |
| Success       | `#10b981` |
| Danger        | `#ef4444` |

---

## 9. Conditional Ternary Styling
**Location:** `gm_dashboard.html:342`

State-dependent colors use inline ternaries, not CSS classes.

```js
color: mod > 0 ? '#10b981' : mod < 0 ? '#ef4444' : '#9ca3af'
```

---

## 10. Debounced Auto-Save
**Location:** `gm_dashboard.html:1335–1340`

`useRef` timer cleared and reset on every state change; 2500ms delay. Manual save also available via Header button. Do not add secondary persistence mechanisms.
