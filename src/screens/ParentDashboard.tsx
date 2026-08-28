/* דשבורד הורים — מעקב תרגול והתקדמות (לא אבחון).
   כניסה: לחיצה ארוכה על הלוגו + קוד 4 ספרות. */
import { useMemo, useState } from 'react';
import { exportSave, importSave } from '../state/persistence';
import { getState, replaceState, resetActiveProfile, setParentContent, updateSettings, useStore } from '../state/store';
import { LAND_ORDER, LANDS, landColor } from '../config/lands';
import { enginesForLand, playableLands } from '../engines';
import { accuracy } from '../scheduler/leveling';
import { weeklyRecommendations } from '../scheduler/recommendations';
import { Button } from '../components/Button';
import { EchoDiagnosticsPanel } from '../components/games/EchoDiagnosticsPanel';
import { hasHebrewVoice, listHebrewVoices, speak } from '../audio/speech';
import type { LandId, Settings } from '../types';
import { MULTIPLICATION_FACTS, MULTIPLICATION_FACT_BY_ID } from '../learning/multiplicationFacts';

type View = 'day' | 'week' | 'month';
type Tab = 'stats' | 'content' | 'settings';

export function ParentDashboard({ onExit }: { onExit: () => void }) {
  const settings = useStore((s) => s.settings);
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);

  if (!authed) {
    return (
      <Gate
        onCancel={onExit}
        error={err}
        pin={pin}
        setPin={setPin}
        onSubmit={() => {
          if (pin === settings.parentPin) setAuthed(true);
          else {
            setErr(true);
            setPin('');
          }
        }}
      />
    );
  }
  return <Dashboard onExit={onExit} />;
}

function Gate({ pin, setPin, onSubmit, onCancel, error }: { pin: string; setPin: (s: string) => void; onSubmit: () => void; onCancel: () => void; error: boolean }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--gray-100)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 24 }}>
      <h2>אזור הורים</h2>
      <p style={{ opacity: 0.7 }}>הזינו קוד בן 4 ספרות</p>
      <div dir="ltr" style={{ display: 'flex', gap: 10 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ width: 40, height: 50, border: '2px solid var(--gray-300)', borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 26, fontFamily: 'var(--font-display)', background: 'var(--panel)' }}>
            {pin[i] ? '•' : ''}
          </div>
        ))}
      </div>
      {error && <div style={{ color: 'var(--btn-red)', fontWeight: 700 }}>קוד שגוי, נסו שוב</div>}
      <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, width: 220 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => (
          <button
            key={d}
            onClick={() => pin.length < 4 && setPin(pin + d)}
            style={{ padding: 14, fontSize: 22, fontFamily: 'var(--font-display)', borderRadius: 12, border: '2px solid var(--gray-300)', background: 'var(--panel)', gridColumn: d === 0 ? '2' : undefined }}
          >
            {d}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="red" onClick={onCancel}>ביטול</Button>
        <Button variant="green" onClick={onSubmit} disabled={pin.length < 4}>כניסה</Button>
      </div>
      <p style={{ fontSize: 12, opacity: 0.5 }}>ברירת מחדל: 1234</p>
    </div>
  );
}

function Dashboard({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState<Tab>('stats');
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--gray-100)', overflowY: 'auto', color: 'var(--ink)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 3, background: 'var(--btn-blue)', color: '#fff', padding: 'calc(12px + var(--safe-top)) 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <b style={{ fontFamily: 'var(--font-head)', fontSize: 20 }}>אזור הורים</b>
        <button onClick={onExit} style={{ background: '#fff', color: 'var(--ink)', border: 'none', borderRadius: 999, padding: '6px 14px', fontWeight: 700 }}>יציאה</button>
      </header>

      <nav style={{ display: 'flex', gap: 6, padding: 10, position: 'sticky', top: 56, background: 'var(--gray-100)', zIndex: 2 }}>
        {([['stats', 'התקדמות'], ['content', 'ניהול תוכן'], ['settings', 'הגדרות']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', fontWeight: 700, fontFamily: 'var(--font-head)', background: tab === t ? 'var(--btn-blue)' : 'var(--panel)', color: tab === t ? '#fff' : 'var(--ink)' }}
          >
            {label}
          </button>
        ))}
      </nav>

      <div style={{ padding: '4px 14px 60px' }}>
        {tab === 'stats' && <StatsTab />}
        {tab === 'content' && <ContentTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>

      <footer style={{ position: 'fixed', bottom: 0, insetInline: 0, maxWidth: 520, margin: '0 auto', background: 'var(--ink)', color: '#fff', textAlign: 'center', fontSize: 12, padding: 8 }}>
        הנתונים משקפים תרגול באפליקציה בלבד
      </footer>
    </div>
  );
}

/* ---------- לשונית התקדמות ---------- */
function StatsTab() {
  const [view, setView] = useState<View>('week');
  const state = useStore((s) => s);
  const days = view === 'day' ? 1 : view === 'week' ? 7 : 30;

  const recent = useMemo(() => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return state.history.filter((h) => new Date(h.day).getTime() >= cutoff);
  }, [state.history, days]);

  const minutes = recent.reduce((a, h) => a + h.minutes, 0);
  const maxSpan = Math.max(0, ...Object.values(state.stats).map((s) => s.maxSpan));
  const practicedDays = new Set(recent.filter((h) => h.minutes > 0).map((h) => h.day)).size;
  const consistency = Math.round((practicedDays / days) * 100);
  const recs = weeklyRecommendations(state);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {([['day', 'היום'], ['week', 'השבוע'], ['month', 'החודש']] as [View, string][]).map(([v, l]) => (
          <button key={v} onClick={() => setView(v)} style={{ flex: 1, padding: 8, borderRadius: 8, border: 'none', fontWeight: 700, background: view === v ? 'var(--ink)' : 'var(--panel)', color: view === v ? '#fff' : 'var(--ink)' }}>{l}</button>
        ))}
      </div>

      {/* מדדים ראשיים */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <BigStat label="span ספרות מרבי" value={maxSpan} highlight />
        <BigStat label="דקות תרגול" value={minutes} />
        <BigStat label="רצף ימים" value={state.streakDays} />
        <BigStat label="עקביות" value={`${consistency}%`} />
      </div>

      {/* גרף דקות ליום */}
      <Card title="דקות תרגול ליום">
        <MinutesChart history={recent} />
      </Card>

      <MultiplicationSummary state={state} days={days} />

      {/* טבלת ארצות */}
      <Card title="לפי ארץ">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {playableLands().map((land) => (
            <LandRow key={land} land={land} state={state} />
          ))}
          {LAND_ORDER.filter((l) => !playableLands().includes(l)).map((land) => (
            <div key={land} style={{ opacity: 0.5, fontSize: 14 }}>{LANDS[land].name} — בקרוב</div>
          ))}
        </div>
      </Card>

      {/* המלצות */}
      <Card title="המלצות השבוע">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recs.map((r) => (
            <div key={r.id} style={{ borderInlineStart: `4px solid ${r.color}`, background: 'var(--panel)', padding: '10px 12px', borderRadius: 8, fontSize: 14 }}>{r.text}</div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function LandRow({ land, state }: { land: LandId; state: ReturnType<typeof getState> }) {
  const color = landColor(land);
  const engs = enginesForLand(land);
  if (land === 'connections') {
    const practiced = Object.keys(state.multiplication.facts).length;
    return (
      <div style={{ background: 'var(--panel)', borderRadius: 10, padding: 10, border: `2px solid ${color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-head)', fontWeight: 700 }}>
          <span style={{ color }}>{LANDS[land].name}</span>
          <span>{practiced} עובדות נפגשו</span>
        </div>
        <div style={{ marginTop: 7, fontSize: 13, opacity: 0.75 }}>ההתקדמות מוצגת לפי עובדה, סוג שליפה ועזרה — בלי ציון כפל כולל.</div>
      </div>
    );
  }
  const accs = engs.map((e) => state.stats[e.id]).filter(Boolean);
  const acc = accs.length ? Math.round((accs.map(accuracy).reduce((a, b) => a + b, 0) / accs.length) * 100) : 0;
  const level = Math.round(engs.map((e) => state.stats[e.id]?.level ?? 1).reduce((a, b) => a + b, 0) / engs.length);
  const rt = accs.length ? Math.round(accs.map((s) => s.medianRtMs).reduce((a, b) => a + b, 0) / accs.length) : 0;
  return (
    <div style={{ background: 'var(--panel)', borderRadius: 10, padding: 10, border: `2px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-head)', fontWeight: 700 }}>
        <span style={{ color }}>{LANDS[land].name}</span>
        <span className="ltr">רמה {level}/15</span>
      </div>
      <div style={{ height: 10, background: 'var(--gray-300)', borderRadius: 999, overflow: 'hidden', margin: '6px 0' }}>
        <div style={{ width: `${acc}%`, height: '100%', background: color }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, opacity: 0.75 }}>
        <span>דיוק <b className="ltr">{acc}%</b></span>
        <span>זמן תגובה <b className="ltr">{(rt / 1000).toFixed(1)}s</b></span>
      </div>
    </div>
  );
}

function MultiplicationSummary({ state, days }: { state: ReturnType<typeof getState>; days: number }) {
  const counts = { DISCOVERING: 0, STRENGTHENING: 0, FLUENT: 0 };
  for (const fact of MULTIPLICATION_FACTS) counts[state.multiplication.facts[fact.id]?.stage ?? 'DISCOVERING'] += 1;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recentAttempts = state.multiplication.recentAttempts.filter((attempt) => attempt.at >= cutoff);
  const directAttempts = recentAttempts.filter((attempt) => attempt.mode === 'direct').length;
  const supportedAttempts = recentAttempts.length - directAttempts;
  const examples = MULTIPLICATION_FACTS
    .filter((fact) => state.multiplication.facts[fact.id]?.stage === 'STRENGTHENING')
    .slice(0, 3);

  return (
    <Card title="עיר הקשרים — לפי עובדות">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7, marginBottom: 10 }}>
        <FactStage label="מגלים דרך" value={counts.DISCOVERING} color="#D97848" />
        <FactStage label="מחזקים דרך" value={counts.STRENGTHENING} color="#138F91" />
        <FactStage label="דרך מוכרת" value={counts.FLUENT} color="#2E8DF6" />
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink)', opacity: 0.78 }}>בתקופה שנבחרה: {directAttempts} ניסיונות שליפה ישירה · {supportedAttempts} ניסיונות עם קשר או עזרה.</div>
      {examples.length > 0 ? (
        <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
          {examples.map((fact) => {
            const anchorId = state.multiplication.facts[fact.id]?.lastAnchorFactId;
            const anchor = anchorId ? MULTIPLICATION_FACT_BY_ID.get(anchorId) : undefined;
            return (
              <div key={fact.id} dir="ltr" style={{ padding: '7px 9px', borderRadius: 9, background: '#E8F9F7', borderInlineStart: '4px solid #138F91', textAlign: 'left', fontWeight: 700 }}>
                {fact.a}×{fact.b} — מתחזק{anchor ? ` בעזרת ${anchor.a}×${anchor.b}` : ''}
              </div>
            );
          })}
        </div>
      ) : null}
      <p style={{ margin: '10px 0 0', fontSize: 12, opacity: 0.65 }}>השלבים מתארים דפוסי תרגול בתוך MemoLand בלבד ואינם אבחון.</p>
    </Card>
  );
}

function FactStage({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ padding: '9px 4px', textAlign: 'center', borderRadius: 10, background: '#fff', border: `2px solid ${color}` }}>
      <div className="ltr" style={{ color, fontFamily: 'var(--font-display)', fontSize: 27 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700 }}>{label}</div>
    </div>
  );
}

function MinutesChart({ history }: { history: ReturnType<typeof getState>['history'] }) {
  const data = history.slice(-14);
  const max = Math.max(1, ...data.map((h) => h.minutes));
  if (data.length === 0) return <p style={{ opacity: 0.6, fontSize: 14 }}>אין נתונים עדיין — התחילו מסע!</p>;
  return (
    <div dir="ltr" style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 90 }}>
      {data.map((h) => (
        <div key={h.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ width: '100%', height: `${(h.minutes / max) * 70}px`, background: 'var(--btn-blue)', borderRadius: '4px 4px 0 0', minHeight: 3 }} />
          <span style={{ fontSize: 9, opacity: 0.6 }}>{h.day.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

function BigStat({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div style={{ background: 'var(--panel)', borderRadius: 12, padding: 12, textAlign: 'center', border: highlight ? '2px solid var(--btn-blue)' : '2px solid var(--gray-300)' }}>
      <div className="ltr" style={{ fontFamily: 'var(--font-display)', fontSize: highlight ? 40 : 30, color: highlight ? 'var(--btn-blue)' : 'var(--ink)' }}>{value}</div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--gray-100)', borderRadius: 12 }}>
      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <div style={{ background: 'var(--panel)', borderRadius: 12, padding: 12, border: '1px solid var(--gray-300)' }}>{children}</div>
    </div>
  );
}

/* ---------- לשונית ניהול תוכן ---------- */
function ContentTab() {
  const content = useStore((s) => s.parentContent);
  const [title, setTitle] = useState('');
  const [items, setItems] = useState('');
  const [sentence, setSentence] = useState('');

  function addList() {
    if (!title.trim() || !items.trim()) return;
    const list = { title: title.trim(), items: items.split('\n').map((s) => s.trim()).filter(Boolean) };
    setParentContent({ ...content, wordLists: [...content.wordLists, list] });
    setTitle('');
    setItems('');
  }
  function addSentence() {
    if (!sentence.trim()) return;
    setParentContent({ ...content, sentences: [...content.sentences, sentence.trim()] });
    setSentence('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card title="רשימת מילים לטירת האוצר">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="כותרת (למשל: מילים באנגלית)" style={inputStyle} />
        <textarea value={items} onChange={(e) => setItems(e.target.value)} placeholder={'פריט בכל שורה\napple\nbanana'} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="green" onClick={addList}>הוסף רשימה</Button>
          <Button variant="orange" onClick={() => speak(items.split('\n').join(', '), 0.9)}>🔊 תצוגה מקדימה</Button>
        </div>
      </Card>

      <Card title="משפט למערת ההדים">
        <input value={sentence} onChange={(e) => setSentence(e.target.value)} placeholder="הקלד משפט" style={inputStyle} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="green" onClick={addSentence}>הוסף משפט</Button>
          <Button variant="orange" onClick={() => speak(sentence, 0.9)}>🔊 האזן</Button>
        </div>
      </Card>

      <Card title={`תוכן שמור (${content.wordLists.length} רשימות, ${content.sentences.length} משפטים)`}>
        {content.wordLists.length === 0 && content.sentences.length === 0 && <p style={{ opacity: 0.6, fontSize: 14 }}>עדיין לא הוזן תוכן.</p>}
        {content.wordLists.map((l, i) => (
          <div key={i} style={{ fontSize: 14, marginBottom: 4 }}>📋 <b>{l.title}</b> — {l.items.length} פריטים</div>
        ))}
        {content.sentences.map((s, i) => (
          <div key={i} style={{ fontSize: 14, marginBottom: 4 }}>💬 {s}</div>
        ))}
      </Card>
    </div>
  );
}

/* ---------- לשונית הגדרות ---------- */
function SettingsTab() {
  const settings = useStore((s) => s.settings);
  const [pin1, setPin1] = useState('');

  function set<K extends keyof Settings>(k: K, v: Settings[K]) {
    updateSettings({ [k]: v } as Partial<Settings>);
  }

  function doExport() {
    const blob = new Blob([exportSave(getState())], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memoland-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function doImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((txt) => {
      try {
        replaceState(importSave(txt));
        alert('הנתונים יובאו בהצלחה');
      } catch {
        alert('קובץ לא תקין');
      }
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card title="אורך המסע">
        <div style={{ display: 'flex', gap: 8 }}>
          {([10, 15, 20, 25] as const).map((m) => (
            <button key={m} onClick={() => set('sessionMinutes', m)} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', fontWeight: 700, background: settings.sessionMinutes === m ? 'var(--btn-blue)' : 'var(--panel)', color: settings.sessionMinutes === m ? '#fff' : 'var(--ink)' }}>{m}׳</button>
          ))}
        </div>
      </Card>

      <Card title="מהירות הקראה">
        <input type="range" min={0.6} max={1.2} step={0.1} value={settings.speechRate} onChange={(e) => set('speechRate', Number(e.target.value))} style={{ width: '100%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span>איטי</span>
          <button onClick={() => speak('שלום, זו מהירות ההקראה', settings.speechRate)} style={{ border: 'none', background: 'none', color: 'var(--btn-blue)', fontWeight: 700 }}>🔊 בדיקה ({settings.speechRate})</button>
          <span>מהיר</span>
        </div>
      </Card>

      <Card title="קול ההקראה (עברית)">
        <VoicePicker current={settings.voiceName} rate={settings.speechRate} onPick={(name) => set('voiceName', name)} />
      </Card>

      <Card title="אבחון שמע זמני">
        <EchoDiagnosticsPanel />
      </Card>

      <Card title="אפקטים קוליים">
        <Toggle on={settings.soundEffects} onChange={(v) => set('soundEffects', v)} label="השמעת צלילים" />
      </Card>

      <Card title="אישור הורה להוראות פיזיות">
        <Toggle on={settings.parentConfirmsPhysical} onChange={(v) => set('parentConfirmsPhysical', v)} label="ההורה מאשר בסיום" />
      </Card>

      <Card title="שעת תזכורת יומית">
        <input type="time" value={settings.reminderHour != null ? `${String(settings.reminderHour).padStart(2, '0')}:00` : ''} onChange={(e) => set('reminderHour', e.target.value ? Number(e.target.value.slice(0, 2)) : null)} style={inputStyle} />
      </Card>

      <Card title="שינוי קוד הורים">
        <input inputMode="numeric" maxLength={4} value={pin1} onChange={(e) => setPin1(e.target.value.replace(/\D/g, ''))} placeholder="קוד חדש (4 ספרות)" style={inputStyle} />
        <Button variant="green" disabled={pin1.length !== 4} onClick={() => { set('parentPin', pin1); setPin1(''); alert('הקוד עודכן'); }}>שמור קוד</Button>
      </Card>

      <Card title="נתונים">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button variant="blue" onClick={doExport}>ייצוא נתונים (גיבוי)</Button>
          <label style={{ background: 'var(--btn-orange)', color: '#fff', padding: '12px 20px', borderRadius: 14, textAlign: 'center', fontWeight: 700, cursor: 'pointer', border: '2px solid #fff' }}>
            ייבוא נתונים
            <input type="file" accept="application/json" onChange={doImport} style={{ display: 'none' }} />
          </label>
          <Button variant="red" onClick={() => { if (confirm('לאפס את כל ההתקדמות של המשתמש הנוכחי? פעולה זו אינה הפיכה.')) { resetActiveProfile(); alert('ההתקדמות אופסה'); } }}>איפוס התקדמות המשתמש</Button>
        </div>
      </Card>
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
      <span>{label}</span>
      <button onClick={() => onChange(!on)} style={{ width: 52, height: 30, borderRadius: 999, border: 'none', background: on ? 'var(--btn-green)' : 'var(--gray-300)', position: 'relative', transition: 'background .2s' }}>
        <span style={{ position: 'absolute', top: 3, insetInlineStart: on ? 25 : 3, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'inset-inline-start .2s' }} />
      </button>
    </label>
  );
}

/** בורר קול עברי + התרעה אם אין קול עברי במכשיר. */
function VoicePicker({ current, rate, onPick }: { current: string | null; rate: number; onPick: (name: string | null) => void }) {
  const voices = listHebrewVoices();
  const available = hasHebrewVoice();
  if (!available) {
    return (
      <div style={{ fontSize: 14, color: 'var(--ink)' }}>
        <p style={{ margin: '0 0 6px' }}>
          ⚠️ לא נמצא קול עברי במכשיר. ההקראה עשויה להישמע לא תקין.
        </p>
        <p style={{ margin: 0, opacity: 0.7 }}>
          כדי להתקין קול עברי: הגדרות המכשיר → נגישות → תוכן מדובר / דיבור → הוספת קול → עברית.
        </p>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <select
        value={current ?? ''}
        onChange={(e) => onPick(e.target.value || null)}
        style={{ ...inputStyle, marginBottom: 0 }}
      >
        <option value="">אוטומטי (הכי טוב שנמצא)</option>
        {voices.map((v) => (
          <option key={v.name} value={v.name}>
            {v.name} ({v.lang})
          </option>
        ))}
      </select>
      <button onClick={() => speak('שלום, אני הקול של ממו לנד', rate)} style={{ border: 'none', background: 'none', color: 'var(--btn-blue)', fontWeight: 700, alignSelf: 'flex-start' }}>
        🔊 בדיקת קול
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 10,
  borderRadius: 8,
  border: '2px solid var(--gray-300)',
  fontFamily: 'var(--font-body)',
  fontSize: 16,
  marginBottom: 8,
  boxSizing: 'border-box',
};
