/* מסך בחירת משתמש — "מי משחק היום?".
   לכל פרופיל התקדמות נפרדת. אפשר להוסיף, לבחור, ולמחוק פרופילים. */
import { useState } from 'react';
import { createProfile, deleteProfile, selectProfile, updateProfileAvatar, useProfiles } from '../state/store';
import { Guide } from '../components/svg/Memo';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import type { AvatarKind } from '../types';
import './profile-screen.css';

const AVATARS: { kind: AvatarKind; label: string }[] = [
  { kind: 'memo', label: 'ממו' },
  { kind: 'mima', label: 'מימה' },
  { kind: 'dragonBoy', label: 'דרקון נווט' },
  { kind: 'dragonGirl', label: 'דרקונית אור' },
  { kind: 'water', label: 'קוסם המים' },
  { kind: 'purple', label: 'שומר הרונות' },
  { kind: 'mushroom', label: 'קוסם היער' },
  { kind: 'turtle', label: 'קוסם הדרכים' },
];

export function ProfileScreen({ onReady }: { onReady: () => void }) {
  const profiles = useProfiles((r) => r.profiles);
  const [adding, setAdding] = useState(profiles.length === 0);
  const [editing, setEditing] = useState(false);
  const [avatarProfileId, setAvatarProfileId] = useState<string | null>(null);
  const avatarProfile = profiles.find((profile) => profile.id === avatarProfileId);

  return (
    <div className="ml-profile-screen">
      <div className="ml-profile-screen__glow" aria-hidden />
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
          <div className="ml-profile-screen__heading">
            <span>יוצאים להרפתקה</span>
            <h2>מי משחק היום?</h2>
          </div>

          <div className="ml-profile-grid">
            {profiles.map((p) => (
              <div key={p.id} className="ml-profile-card-wrap">
                <button
                  className="ml-profile-card ml-pressable"
                  onClick={() => {
                    if (editing) {
                      setAvatarProfileId(p.id);
                      return;
                    }
                    selectProfile(p.id);
                    onReady();
                  }}
                >
                  <Guide kind={p.avatar} size={66} />
                  <span>{p.name}</span>
                  <small>בחירת מסע</small>
                </button>
                {editing && (
                  <>
                    <span className="ml-profile-card__change">החלפת דמות</span>
                    <button
                      aria-label={`מחק את ${p.name}`}
                      onClick={() => {
                        if (confirm(`למחוק את הפרופיל "${p.name}" ואת כל ההתקדמות שלו?`)) deleteProfile(p.id);
                      }}
                      className="ml-profile-card__delete"
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            ))}

            {/* הוספת שחקן */}
            <button
              className="ml-profile-card ml-profile-card--new ml-pressable"
              onClick={() => setAdding(true)}
            >
              <span style={{ fontSize: 40, lineHeight: 1 }}>＋</span>
              <span>שחקן חדש</span>
            </button>
          </div>

          {profiles.length > 0 && (
            <button
              onClick={() => setEditing((e) => !e)}
              className="ml-profile-edit"
            >
              {editing ? 'סיום' : 'עריכה'}
            </button>
          )}
          {avatarProfile && (
            <AvatarPicker
              name={avatarProfile.name}
              selected={avatarProfile.avatar}
              onSelect={(avatar) => {
                updateProfileAvatar(avatarProfile.id, avatar);
                setAvatarProfileId(null);
              }}
              onCancel={() => setAvatarProfileId(null)}
            />
          )}
        </>
      )}
    </div>
  );
}

function AvatarPicker({
  name,
  selected,
  onSelect,
  onCancel,
}: {
  name: string;
  selected: AvatarKind;
  onSelect: (avatar: AvatarKind) => void;
  onCancel: () => void;
}) {
  return (
    <div className="ml-avatar-picker" role="dialog" aria-modal="true" aria-label={`בחירת דמות עבור ${name}`}>
      <div className="ml-avatar-picker__card">
        <span className="ml-add-profile__eyebrow">הדמות במסע</span>
        <h2>בחרו דמות חדשה</h2>
        <div className="ml-add-profile__avatars">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.kind}
              type="button"
              className={selected === avatar.kind ? 'is-selected' : ''}
              onClick={() => onSelect(avatar.kind)}
              aria-label={avatar.label}
            >
              <Guide kind={avatar.kind} size={50} />
            </button>
          ))}
        </div>
        <Button variant="red" onClick={onCancel} block>ביטול</Button>
      </div>
    </div>
  );
}

function AddProfile({ onCreate, onCancel }: { onCreate: (name: string, avatar: AvatarKind) => void; onCancel?: () => void }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<AvatarKind>('memo');
  return (
    <div className="ml-add-profile">
      <span className="ml-add-profile__eyebrow">דרכון להרפתקה</span>
      <h2>שחקן חדש</h2>
      <Guide kind={avatar} size={90} />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="איך קוראים לך?"
        maxLength={12}
        className="ml-add-profile__input"
      />
      <div className="ml-add-profile__avatars">
        {AVATARS.map((a) => (
          <button
            key={a.kind}
            onClick={() => setAvatar(a.kind)}
            aria-label={a.label}
            className={avatar === a.kind ? 'is-selected' : ''}
          >
            <Guide kind={a.kind} size={44} />
          </button>
        ))}
      </div>
      <div className="ml-add-profile__actions">
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
