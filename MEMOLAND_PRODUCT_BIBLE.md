# MemoLand Product Bible

**Version:** 1.0  
**Status:** Authoritative product-direction reference  
**Audience:** Product, design, engineering, research, and parent-experience teams  
**Primary users:** Children approximately ages 7–11  
**Language direction:** Hebrew-first, RTL

This document defines what MemoLand is, what the experience should mean to a child, and which product boundaries must be preserved. Visual decisions belong in `MEMOLAND_DESIGN_BIBLE.md`; scientific interpretation belongs in `MEMOLAND_COGNITIVE_FRAMEWORK.md`; world-specific mechanics belong in `MEMOLAND_WORLDS_SPEC.md`.

---

## 1. Product vision

MemoLand is a memory-training adventure game.

It is a **game first** and an educational/cognitive product second. A child should open it because an adventure is waiting—not because an adult assigned practice.

The desired immediate reaction is:

> הופה, משהו קרה פה.

The desired longer-term internal story is:

- “I can do this.”
- “I discovered something.”
- “I got better at something that used to be difficult.”

MemoLand must never feel like:

- a school worksheet;
- remediation or assessment software;
- a clinical tool;
- a generic educational app;
- an analytics dashboard with mini-games attached.

MemoLand may support learning and observation, but it must not present itself as diagnosis or treatment.

---

## 2. Core emotional values

### 2.1 מסוגלות / Capability

The child should encounter attainable challenge, experience genuine success, and understand that effort and strategy matter. Difficulty may grow, but the product must protect dignity and the possibility of recovery.

### 2.2 סקרנות / Curiosity

The world should invite the child to discover what happens next. Small environmental changes, Memo's reactions, and long-term progression should create questions without overwhelming the cognitive task.

### 2.3 הישגיות / Achievement

Progress should feel earned and visible. Achievement is not restricted to correct answers: attentive engagement, a genuine retrieval attempt, trying again, sustained practice, and completing a journey can all be meaningful.

These values are coequal. Capability without curiosity becomes a worksheet; curiosity without meaningful challenge becomes decoration; achievement without psychological safety becomes a score chase.

---

## 3. Product principles

1. **Adventure before administration.** Child-facing screens prioritize place, character, action, and discovery.
2. **Practice without defect language.** Forgetting is normal. A mistake is an event, not an identity.
3. **Behavior before lecture.** When a strategy can be demonstrated in play, do not explain it first in instructional prose.
4. **Short, meaningful encounters.** Prefer repeatable moments with a clear cognitive purpose over long drills.
5. **Progress is additive.** Earned progress does not disappear because of one forgotten answer.
6. **Interpretation stays narrower than evidence.** Product metrics describe observed interactions, not hidden traits or diagnoses.
7. **Presentation does not silently change game logic.** Existing engines, scoring, progression, persistence, and scheduler behavior remain protected unless a separately approved logic sprint changes them.
8. **Child and parent needs are separated.** The child gets a game; the parent gets careful context, not a report card.

---

## 4. Memo's permanent role

Memo is not a teacher, examiner, clinician, or omniscient mascot. Memo is a companion who also has to remember.

Permanent principle:

> Memo never explains how to remember when behavior can demonstrate it.

Memo models this sequence:

```text
PAUSE
  ↓
ATTEND
  ↓
ENCODE
  ↓
RETRIEVE
  ↓
RESPOND
  ↓
CELEBRATE
```

### 4.1 Reusable states

| State | Product meaning | Expected behavior |
|---|---|---|
| `IDLE` | Safe, available companionship | Calm and friendly |
| `ATTENTIVE` | Information deserves a pause | Becomes still and focuses on the stimulus |
| `LISTENING` | Sound is the current source | Orients toward sound and listens quietly |
| `THINKING` | Retrieval takes effort | Gently scratches his head while trying to remember |
| `SUCCESS` | Shared delight | Exactly two small excited hops |

Memo may forget. If he does, the moment should normalize retrieval difficulty and recovery. He must never imply that forgetting makes a child defective.

---

## 5. The cognitive-pause product hypothesis

A central product challenge is responding before information has been fully absorbed. MemoLand should not repeatedly instruct the child with commands such as “wait,” “slow down,” or “concentrate.”

Instead, interaction design should create a brief natural pause:

```text
stop → look/listen → absorb → retrieve
```

Memo demonstrates the pause. The child is given a reason to observe before acting. This is a **product hypothesis**, not a diagnosis and not proof of impulsivity. Beta observation should ask whether the child begins to adopt the sequence voluntarily.

Prohibited interpretation:

- “fast response = impulsive child”;
- “mistake = did not pay attention”;
- “long encoding time = weak memory.”

The same result can arise from attention, encoding, load, interference, retrieval, motor input, unfamiliarity, fatigue, or product design.

---

## 6. Practice and mistakes

Meaningful progress may conceptually come from:

- practice;
- a genuine attempt;
- an effortful retrieval attempt;
- attentive listening or looking;
- trying again;
- completing Daily Journey;
- sustained practice across days;
- demonstrated improvement at comparable difficulty.

Mistakes never:

- delete a pathway;
- darken or damage a brain visualization;
- remove earned progress;
- collapse a constructed city;
- define a child as weak.

Feedback should preserve information and momentum: something did not work yet, the next attempt remains possible, and no earned identity is lost.

---

## 7. The brain-pathways metaphor

Permanent child-facing concept:

> המוח שלי בונה מסלולים חדשים

Supporting wording:

> בכל פעם שאני מתאמן, המוח שלי לומד ובונה קשרים חדשים.

Internal product formulation:

> The brain builds new pathways and connections through practice.

This is a motivational progression metaphor. It is **not** a measurement of neural structure or activity.

### 7.1 Allowed progression language

- pathways light up or connect;
- the network becomes richer;
- practice adds discoveries;
- a new route appears after meaningful participation;
- the child notices a subtle long-term change.

### 7.2 Forbidden representations and claims

Do not create:

- Brain Power %;
- Brain Strength %;
- Brain Score;
- Weak Brain / Strong Brain ratings;
- measured neural-connection counts;
- MRI-like or clinical-looking measurements;
- IQ, brain-health, hippocampal-growth, or neurological-activity claims.

Never say “your brain became 25% stronger.” The child's brain starts whole and valuable. Progress adds richness; it never repairs a “bad brain.”

---

## 8. Two reward timescales

### 8.1 Immediate reward

Use a restrained response close to the action:

- a small spark or short glow;
- Memo's two hops;
- a small environmental reaction;
- a satisfying, optional sound;
- clear, encouraging feedback.

Immediate rewards should not obscure the next task, distort timing, or make every tap equally spectacular.

### 8.2 Long-term reward

Over days and weeks, practice may reveal:

- a new pathway or connection;
- a richer network;
- world progression;
- completed places or structures;
- subtle discoveries that were not announced in advance.

The ideal social moment is:

> אמא, תראי מה קרה למוח שלי!

Long-term rewards should represent sustained participation and demonstrated learning patterns, not a single correct answer.

---

## 9. Daily Journey and Free Play

MemoLand separates two contexts because they answer different questions.

| Context | Primary purpose | What it can reveal |
|---|---|---|
| **Daily Journey / Structured Exposure** | Short, balanced, longitudinal practice | Performance under planned exposure |
| **Free Play / Free Choice** | Agency, exploration, preference | What the child chooses when choice is available |

### 9.1 Long-term Daily Journey direction

Daily Journey is the structured core training loop. The product direction is approximately **6–9 minutes total**, with one short meaningful activity from every active world.

This is small repeated longitudinal sampling—not six assessments every day.

The order should not be identical every day. Rotation can reduce habitual responding, fatigue effects, novelty loss, and order bias. However, a journey should not deliberately begin every day with the child's most difficult area; the opening should offer a reasonable chance to feel capable.

### 9.2 Current implementation boundary

The current Beta scheduler uses a seven-step journey with configurable 10–25 minute sessions, a strong-area warmup, delayed reveal/recall, rotation weighted toward lower observed accuracy, a timed speed segment, and a guaranteed easier finish. That behavior remains unchanged in the present compatibility/documentation sprint.

The 6–9 minute, every-active-world direction requires a separate product and scheduler implementation sprint with migration, validation, and explicit approval.

### 9.3 Free Play after Daily Journey

Future child-facing transition:

> המסע הושלם. לאן בא לך ללכת עכשיו?

Store, when implemented:

`first_free_choice_after_daily_journey`

This choice is potentially informative because all active worlds were recently experienced. It is still preference data, not an ability diagnosis.

---

## 10. Parent metrics: three separate constructs

### 10.1 Ability

How the child performs when exposed to a task in structured Daily Journey, at a documented difficulty and support level.

### 10.2 Preference

Which worlds the child voluntarily chooses in Free Play, particularly the first choice after Daily Journey.

### 10.3 Growth

How performance changes longitudinally across comparable difficulty, support, stimulus structure, and spacing.

These constructs must not be collapsed into one score.

| Observed combination | Careful interpretation |
|---|---|
| High ability + high preference | A confidence/strength area that attracts the child |
| High ability + low preference | Capable, but not naturally preferred right now |
| Developing ability + high preference | Challenging and attractive |
| Developing ability + low preference | Worth observing; no automatic label |

Low preference may reflect difficulty, boredom, game design, mood, fatigue, familiarity, or interest. The last category must not automatically be labeled “weakness.”

The parent dashboard is not a report card.

---

## 11. Child Mode and Parent Mode

MemoLand should eventually be one application with clearly separated experiences.

### 11.1 Child Mode

- opens directly into the game;
- no normal login friction;
- no analytics dashboard;
- no sensitive interpretation;
- no account administration;
- no parent controls mixed into play.

### 11.2 Parent Mode

Parent Mode may eventually show:

- Daily Journey completion and activity frequency;
- performance by world at comparable difficulty;
- preference and growth as separate constructs;
- difficulty reached and support used;
- useful, carefully worded behavioral observations;
- first Free Play choice after Daily Journey.

A hidden button or simple PIN is not authentication. A lightweight local gate may protect low-risk navigation only. Sensitive data and account changes require real authenticated parent access.

---

## 12. Persistence and cross-device direction

### 12.1 Current Beta

The current app stores a local profile registry and per-profile `SaveState` in browser `localStorage` (`memoland.profiles.v1` and `memoland.save.v1.<profileId>`). It supports multiple profiles on one browser and offline continuity, but data is tied to that browser origin and device.

### 12.2 Future requirement

The scenario “child plays on the child phone while a parent sees progress on another phone” requires:

- offline/local persistence;
- cloud synchronization;
- authenticated parent identity;
- child-profile linkage;
- secure authorization and recovery;
- conflict and migration rules;
- privacy, retention, export, and deletion controls.

No backend, authentication, or cloud synchronization is authorized by this document. Those require a separate technical-architecture and privacy sprint.

---

## 13. Product safety and claims

MemoLand may describe:

- practice completed;
- task-level performance;
- strategy or help used;
- repeated retrieval success;
- observed change at comparable task settings;
- child preference within MemoLand.

MemoLand must not claim that it:

- raises IQ or makes a child generally smarter;
- guarantees school-grade improvement;
- treats or cures attention problems;
- diagnoses impulsivity, memory disorder, or learning difficulty;
- improves every form of memory;
- measures brain health or neural growth;
- proves a cognitive cause from a correct/incorrect response.

All parent-facing language should use observable descriptions, uncertainty where appropriate, and time/context qualifiers.

---

## 14. Product decision gates

Before adding a feature, ask:

1. Does it strengthen capability, curiosity, or achievement?
2. Does it feel like an adventure before it feels like instruction?
3. Does Memo demonstrate rather than lecture where possible?
4. Does the interaction preserve a useful pause before response?
5. Is progress additive and psychologically safe?
6. Are metrics separated into ability, preference, and growth?
7. Is the claim narrower than the evidence?
8. Does the change preserve existing game logic unless logic change was explicitly approved?
9. Is it usable in Hebrew RTL and on the supported mobile/PWA viewport?
10. Can a parent understand the observation without treating it as diagnosis?

If any answer is “no,” the feature is not ready for implementation.

---

## 15. Current and future scope

### Current active worlds

1. עמק המספרים / Numbers Valley
2. מערת ההדים / Echo Cave
3. יער התמונות / Image Forest
4. הרי התבניות / Pattern Mountains
5. מסלול הזריזות / Speed Track
6. טירת האוצר / Treasure Castle

### Approved future concepts—not yet implemented

7. כביש הזיכרון / Memory Road
8. עיר הקשרים / City of Connections

Their detailed specifications are in `MEMOLAND_WORLDS_SPEC.md`. Recording a concept does not authorize implementation, scheduler changes, new persistence fields, or new claims.

---

## 16. Change-control rule

The Product Bible states product direction. It does not silently override current game behavior.

Any change to scheduler logic, progression, scoring, adaptive rules, persistence schemas, parent authentication, cloud synchronization, brain progression, or world availability requires:

1. a separately approved sprint;
2. explicit current-vs-target behavior;
3. a data and migration plan where relevant;
4. scientific/claim review;
5. automated, responsive, and real-device validation appropriate to risk.

---

**End of MemoLand Product Bible v1.0**
