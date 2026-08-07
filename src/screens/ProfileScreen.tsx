/* מסך בחירת משתמש — "מי משחק היום?".
   לכל פרופיל התקדמות נפרדת. אפשר להוסיף, לבחור, ולמחוק פרופילים. */
import { useState } from 'react';
import { createProfile, deleteProfile, selectProfile, useProfiles } from '../state/store';
import { Guide } from '../components/svg/Memo';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import type { AvatarKind } from '../types';

const AVATARS: { kind: AvatarKind; label: string }[] = [
  { kind: 'memo', label: 'ממו' },
  { kind: 'water', label: 'טיפה' },
  { kind: 'purple', label: 'סגולי' },
  { kind: 'mushroom', label: 'פטרייה' },
  { kind: 'turtle', label: 'צב' },
];

export function ProfileScreen({ onReady }: { onReady: () => void }) {
  const profiles = useProfiles((r) => r.profiles);
  const [adding, setAdding] = useState(profiles.length === 0);
  const [editing, setEditing] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(#67C8FF, #2FA6F6)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
        padding: 'calc(24px + var(--safe-top)) 18px 40px',
      }}
    >
      <Logo variant="compact" width={180} />

      {adding ? (
        <AddProfile
          onCreate={(name, avatar) => {
            createProfile(name, avatar);
            onReady();
          }}
          onCancel={profiles.length ? () => setAdding(false) : undefined}
        />
      ) : (
        <>
          <h2 style={{ color: '#fff', textShadow: '0 2px 3px rgba(36,50,71,.4)' }}>מי משחק היום?</h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', width: '100%' }}>
            {profiles.map((p) => (
              <div key={p.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    if (editing) return;
                    selectProfile(p.id);
                    onReady();
                  }}
                  style={{
                    width: 130,
                    background: 'var(--panel)',
                    border: '4px solid #fff',
                    borderRadius: 20,
                    padding: '14px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 5px 0 rgba(36,50,71,.25)',
                  }}
                >
                  <Guide kind={p.avatar} size={66} />
                  <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 17, color: 'var(--ink)' }}>{p.name}</span>
                </button>
                {editing && (
                  <button
                    aria-label={`מחק את ${p.name}`}
                    onClick={() => {
                      if (confirm(`למחוק את הפרופיל "${p.name}" ואת כל ההתקדמות שלו?`)) deleteProfile(p.id);
                    }}
                    style={{ position: 'absolute', top: -8, insetInlineStart: -8, width: 30, height: 30, borderRadius: '50%', background: 'var(--btn-red)', color: '#fff', border: '2px solid #fff', fontWeight: 700, fontSize: 16 }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            {/* הוספת שחקן */}
            <button
              onClick={() => setAdding(true)}
              style={{
                width: 130,
                background: 'rgba(255,255,255,.25)',
                border: '4px dashed #fff',
                borderRadius: 20,
                padding: '14px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                color: '#fff',
                minHeight: 140,
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 40, lineHeight: 1 }}>＋</span>
              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>שחקן חדש</span>
            </button>
          </div>

          {profiles.length > 0 && (
            <button
              onClick={() => setEditing((e) => !e)}
              style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 700, fontFamily: 'var(--font-head)', fontSize: 16, textDecoration: 'underline' }}
            >
              {editing ? 'סיום' : 'עריכה'}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function AddProfile({ onCreate, onCancel }: { onCreate: (name: string, avatar: AvatarKind) => void; onCancel?: () => void }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<AvatarKind>('memo');
  return (
    <div style={{ background: 'var(--panel)', borderRadius: 24, border: '4px solid #fff', padding: 20, width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', boxShadow: '0 6px 0 rgba(36,50,71,.3)' }}>
      <h2 style={{ color: 'var(--ink)' }}>שחקן חדש</h2>
      <Guide kind={avatar} size={90} />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="איך קוראים לך?"
        maxLength={12}
        style={{ width: '100%', padding: 12, borderRadius: 12, border: '2px solid var(--gray-300)', fontFamily: 'var(--font-body)', fontSize: 18, textAlign: 'center', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {AVATARS.map((a) => (
          <button
            key={a.kind}
            onClick={() => setAvatar(a.kind)}
            aria-label={a.label}
            style={{
              padding: 6,
              borderRadius: 14,
              background: avatar === a.kind ? 'var(--btn-blue)' : 'var(--gray-100)',
              border: `3px solid ${avatar === a.kind ? 'var(--btn-blue)' : 'var(--gray-300)'}`,
            }}
          >
            <Guide kind={a.kind} size={44} />
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
        {onCancel && (
          <Button variant="red" onClick={onCancel} block>
            ביטול
          </Button>
        )}
        <Button variant="green" onClick={() => onCreate(name, avatar)} disabled={!name.trim()} block>
          בוא נתחיל!
        </Button>
      </div>
    </div>
  );
}
