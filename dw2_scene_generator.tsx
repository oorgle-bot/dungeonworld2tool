import { useState, useEffect, useRef } from "react";

const API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `You are a creative assistant for Game Masters running Dungeon World 2 (DW2), a narrative-focused tabletop RPG using the Powered by the Apocalypse framework. You help GMs craft vivid, dramatically compelling scene hooks.

DW2 uses 2d6 rolls:
- 10+ = full success, player mostly gets what they want
- 7-9 = partial success, complication, cost, or reduced effect
- 6- = failure or worse, GM makes a move, player marks XP

Key GM Moves: Hurt them, Advance a Threat, Foreshadow a Threat, Make Them Choose, Escalate the Situation, Separate Them, Take Something Away, Set Up an Immediate Risk, Introduce Something New.

Core DW2 moves GMs should reference: Defy Danger, Recall Lore, Sense Motive, Sneak Past, Influence Choice, Unearth Secrets, Undertake a Journey, Aid a Companion, and the four Battle Moves (Wrest Control, Keep Them Busy, Secure an Edge, All Out Attack).

When given a campaign context and a situation description, output a scene in this EXACT JSON structure:
{
  "hook": "2-3 sentences of vivid, sensory opening narration. Present tense, GM voice, drop the players in medias res.",
  "what_do_you_do": "A single sharp question to end the hook with, asking what the PCs do.",
  "paths": [
    {
      "name": "Short path name (3-5 words)",
      "description": "One sentence: what the player does and what move it might trigger.",
      "on_success": "What a 10+ looks like narratively.",
      "on_mixed": "What a 7-9 complication or cost looks like.",
      "on_failure": "What a 6- consequence or GM move looks like."
    },
    ... (2-3 paths)
  ],
  "gm_notes": "2-3 sentences of private GM advice: what's really going on, a secret to reveal, a twist, or how to connect this to a Threat or PC Conflict.",
  "escalation": "One sentence: what happens if the PCs do nothing or delay too long."
}

Respond with ONLY valid JSON. No markdown fences, no preamble. The narration should feel grounded in the specific campaign world and fiction provided.`;

const STORAGE_KEY = "dw2-campaign-context";

const defaultCampaign = {
  world: "",
  pcs: "",
  threats: "",
  tone: "gritty-heroic"
};

const tones = [
  { value: "gritty-heroic", label: "Gritty & heroic" },
  { value: "dark-horror", label: "Dark & horror-tinged" },
  { value: "swashbuckling", label: "Swashbuckling & fun" },
  { value: "mythic-epic", label: "Mythic & epic" },
  { value: "political-intrigue", label: "Political & intrigue" }
];

function Badge({ children, color }) {
  const colors = {
    success: { bg: "var(--color-background-success)", text: "var(--color-text-success)", border: "var(--color-border-success)" },
    warning: { bg: "var(--color-background-warning)", text: "var(--color-text-warning)", border: "var(--color-border-warning)" },
    danger: { bg: "var(--color-background-danger)", text: "var(--color-text-danger)", border: "var(--color-border-danger)" },
    info: { bg: "var(--color-background-info)", text: "var(--color-text-info)", border: "var(--color-border-info)" },
  };
  const c = colors[color] || colors.info;
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 4, background: c.bg, color: c.text, border: `0.5px solid ${c.border}`, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function RollRow({ label, color, text }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
      <div style={{ flexShrink: 0, paddingTop: 1 }}>
        <Badge color={color}>{label}</Badge>
      </div>
      <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

function PathCard({ path, index }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden", marginBottom: 10 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", flexShrink: 0 }}>{index + 1}</span>
          <span style={{ fontWeight: 500, fontSize: 15, color: "var(--color-text-primary)" }}>{path.name}</span>
        </div>
        <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: "0 16px 14px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
          <p style={{ margin: "12px 0 14px", fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{path.description}</p>
          <RollRow label="10+" color="success" text={path.on_success} />
          <RollRow label="7–9" color="warning" text={path.on_mixed} />
          <RollRow label="6−" color="danger" text={path.on_failure} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [campaign, setCampaign] = useState(defaultCampaign);
  const [situation, setSituation] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem ? null : null;
    } catch {}
    try {
      window.storage.get(STORAGE_KEY).then(r => {
        if (r) setCampaign(JSON.parse(r.value));
      }).catch(() => {});
    } catch {}
  }, []);

  const saveCampaign = async () => {
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(campaign));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const generate = async () => {
    if (!situation.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    const campaignBlock = [
      campaign.world && `World & setting: ${campaign.world}`,
      campaign.pcs && `Active player characters: ${campaign.pcs}`,
      campaign.threats && `Active threats: ${campaign.threats}`,
      `Desired tone: ${tones.find(t => t.value === campaign.tone)?.label}`,
    ].filter(Boolean).join("\n");

    const userMsg = `Campaign context:\n${campaignBlock || "(No campaign context provided)"}\n\nSituation to develop:\n${situation}`;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMsg }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      setError("Something went wrong generating the scene. Check your input and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>

      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>Dungeon World 2</p>
        <h1 style={{ margin: "4px 0 6px", fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)" }}>Scene forge</h1>
        <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>Describe a situation and get a narrative hook, paths forward, and roll guidance — grounded in your campaign.</p>
      </div>

      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", marginBottom: "1rem" }}>
        <button onClick={() => setSettingsOpen(o => !o)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>Campaign context</span>
            {(campaign.world || campaign.pcs || campaign.threats) && !settingsOpen && (
              <Badge color="success">configured</Badge>
            )}
          </div>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", transform: settingsOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▾</span>
        </button>
        {settingsOpen && (
          <div style={{ padding: "0 16px 16px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "12px 0 14px", lineHeight: 1.5 }}>Set this once per campaign. The more detail you add, the more grounded the output will be.</p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>World & setting</label>
              <textarea value={campaign.world} onChange={e => setCampaign(c => ({ ...c, world: e.target.value }))} placeholder="e.g. A crumbling empire at war with undead armies from the eastern wastes. The capital city of Valdris is under siege. Magic is feared by common folk." rows={3} style={{ width: "100%", resize: "vertical", fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>Player characters</label>
              <textarea value={campaign.pcs} onChange={e => setCampaign(c => ({ ...c, pcs: e.target.value }))} placeholder="e.g. Kael (Fighter, haunted war veteran), Yara (Cleric of the sun god, secretly losing her faith), Dominic (Rogue, wanted by the guild)." rows={2} style={{ width: "100%", resize: "vertical", fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>Active threats</label>
              <textarea value={campaign.threats} onChange={e => setCampaign(c => ({ ...c, threats: e.target.value }))} placeholder="e.g. The Necromancer Lord Sevrak is raising an army. The Thieves' Guild wants Dominic dead. A mysterious plague is spreading through the slums." rows={2} style={{ width: "100%", resize: "vertical", fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>Tone</label>
              <select value={campaign.tone} onChange={e => setCampaign(c => ({ ...c, tone: e.target.value }))} style={{ fontSize: 14, width: "100%" }}>
                {tones.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <button onClick={saveCampaign} style={{ fontSize: 13 }}>
              {saved ? "Saved" : "Save context"}
            </button>
          </div>
        )}
      </div>

      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "14px 16px", marginBottom: "1rem" }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Describe the situation</label>
        <textarea value={situation} onChange={e => setSituation(e.target.value)} placeholder="e.g. The party has been tracking the necromancer's supply convoy through the marsh. They've caught up — three wagons, a dozen skeleton guards, and one very nervous-looking human driver who clearly doesn't want to be here." rows={4} style={{ width: "100%", resize: "vertical", fontSize: 14, marginBottom: 10, boxSizing: "border-box" }} />
        <button onClick={generate} disabled={loading || !situation.trim()} style={{ fontSize: 14 }}>
          {loading ? "Forging scene…" : "Forge scene ↗"}
        </button>
        {error && <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--color-text-danger)" }}>{error}</p>}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-tertiary)", fontSize: 14 }}>
          Writing the scene…
        </div>
      )}

      {result && (
        <div ref={resultRef}>
          <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "16px", marginBottom: "1rem" }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary)" }}>Scene hook</p>
            <p style={{ margin: "0 0 10px", fontSize: 15, color: "var(--color-text-primary)", lineHeight: 1.7, fontFamily: "var(--font-serif)" }}>{result.hook}</p>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", fontStyle: "italic" }}>{result.what_do_you_do}</p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary)" }}>Paths forward</p>
            {result.paths?.map((path, i) => <PathCard key={i} path={path} index={i} />)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "14px 16px" }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary)" }}>GM notes</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>{result.gm_notes}</p>
            </div>
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-danger)", borderRadius: "var(--border-radius-lg)", padding: "14px 16px" }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-danger)" }}>If they delay</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>{result.escalation}</p>
            </div>
          </div>

          <div style={{ marginTop: 14, textAlign: "center" }}>
            <button onClick={() => { setResult(null); setSituation(""); }} style={{ fontSize: 13 }}>Clear & start over</button>
          </div>
        </div>
      )}
    </div>
  );
}
