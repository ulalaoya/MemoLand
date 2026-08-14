# MemoLand Worlds Specification

**Version:** 1.0  
**Status:** Authoritative world-purpose and concept reference  
**Audience:** Product, design, engineering, content, and research teams

This document records the purpose and boundaries of every MemoLand world. The six current worlds describe the existing product and must preserve current logic unless a separate sprint explicitly changes it. Memory Road and City of Connections are approved future concepts only; this document does **not** authorize their implementation.

Visual treatment must follow `MEMOLAND_DESIGN_BIBLE.md`. Product meaning must follow `MEMOLAND_PRODUCT_BIBLE.md`. Scientific claims and interpretation must follow `MEMOLAND_COGNITIVE_FRAMEWORK.md`.

---

## 1. World status registry

| Order | World | Internal ID | Status | Current engine(s) |
|---:|---|---|---|---|
| 1 | עמק המספרים / Numbers Valley | `numbers` | Implemented | `numbers.forward`, `numbers.backward`, `numbers.sort`, `numbers.chain` |
| 2 | מערת ההדים / Echo Cave | `echoes` | Implemented | `echoes.repeat`, `echoes.multistep` |
| 3 | יער התמונות / Image Forest | `forest` | Implemented | `forest.grid` |
| 4 | הרי התבניות / Pattern Mountains | `patterns` | Implemented | `patterns.complete` |
| 5 | מסלול הזריזות / Speed Track | `speed` | Implemented | `speed.match` plus Daily Journey speed activity |
| 6 | טירת האוצר / Treasure Castle | `castle` | Implemented | `castle.memorize` |
| 7 | כביש הזיכרון / Memory Road | future ID TBD | Specification only | None |
| 8 | עיר הקשרים / City of Connections | future ID TBD | Specification only | None |

The current `LandId` union, persistence schema, world registry, scheduler, and engine registry include only the first six worlds. Do not add future IDs until an implementation and migration plan is explicitly approved.

---

## 2. Shared world principles

Every world should:

- feel like a place in one coherent adventure;
- have a recognizable cognitive purpose without presenting a clinical label to the child;
- use Memo or another guide to model useful behavior;
- preserve a clear encounter → retrieval/response → feedback loop;
- distinguish task failure from technical failure;
- keep rewards additive and mistakes recoverable;
- use difficulty dimensions that reflect stimulus structure, not only item count;
- meet mobile, Hebrew RTL, accessibility, audio, and reduced-motion requirements;
- avoid unsupported claims about general intelligence, diagnosis, or broad transfer.

Current world availability, order, scoring, progression, and game behavior come from the application. This document must not be used to infer visual locks or logic changes that the code does not currently implement.

---

## 3. Daily Journey role

### 3.1 Current Beta behavior

The current scheduler builds a seven-step journey:

1. easier warmup in an observed stronger world;
2. delayed-recall material exposure;
3. a due spaced item when available;
4. rotation across two lower-observed-accuracy worlds plus one stronger world;
5. a 60-second speed activity;
6. delayed recall;
7. easier guaranteed finish.

Session duration is currently configurable from 10 to 25 minutes. This behavior is preserved in the current sprint.

### 3.2 Approved future direction

Daily Journey should eventually provide one short meaningful activity from **every active world** in approximately 6–9 minutes. When future worlds are implemented and activated, each should join this structured exposure.

The future order should vary within safe constraints:

- do not use the same order every day;
- avoid a consistently difficult opening;
- preserve an early opportunity for success;
- measure order so fatigue and order effects can be separated;
- do not describe the journey as six/eight daily assessments.

This target requires a separately approved scheduler sprint. It is not implemented by this specification.

---

# Part I — Current worlds

## 4. עמק המספרים / Numbers Valley

### Purpose

Working-memory practice with number sequences and mental transformation.

### Current mechanics

- Forward digit span: remember digits in presented order.
- Backward digit span: remember and reverse the order.
- Sort span: remember and sort from low to high.
- Chain arithmetic: maintain and update a running value through multiple operations.

### Current difficulty dimensions

- sequence length grows from 3 toward 9;
- per-digit exposure changes modestly;
- chain step count and numeric range increase;
- multiplication steps may enter at higher levels;
- backward and sort tasks add transformation, not merely length.

### Experience language

Bright first-adventure valley, wide route, foreground-to-horizon depth, and large readable number moments. Memo becomes attentive during encoding, thinks during recall, and uses exactly two hops for success.

### Protected behavior

- number presentation and timing;
- input pad and answer order;
- scoring, retry, and progression;
- Memo state mapping;
- the believable terrain perspective already established.

### Interpretation boundary

A span result is performance on a particular structured task. It is not a general memory-capacity score and must not be interpreted using a fixed “seven items” rule.

---

## 5. מערת ההדים / Echo Cave

### Purpose

Auditory sequential memory and multi-step listening.

### Current mechanics

- Listen and repeat: hear a generated Hebrew sentence, then reconstruct word order.
- Multi-step instructions: hear an ordered instruction, then tap visual targets in sequence.
- Daily Journey content also uses spoken delayed material and later questions.

### Current difficulty dimensions

- sentence word count grows from 3 toward 9;
- multi-step sequence grows from 2 toward 7;
- response requires order, not only recognition;
- replays are limited in the immersive challenge UI.

### Audio-validity rule

An Echo trial is valid only when speech playback reliably begins. The memory/response phase must never advance from an enqueue attempt, guessed duration, or timeout alone. A technical speech failure must produce a recoverable state and must not count as a cognitive attempt.

### Retry rule

Retry must:

- cancel stale queued speech;
- re-check speech availability and voice readiness;
- resume/unpause the synthesis engine;
- create a new utterance held alive until completion;
- wait for confirmed `start` before cognitive timing;
- expose a useful diagnostic path if playback still fails.

### Viewport rule

Memo must remain physically grounded on the cave floor across supported mobile/PWA viewports, including browser chrome and standalone display. He must not be clipped by a stale layout viewport, bottom navigation area, safe area, fixed height assumption, or overflowing flex child.

### Protected behavior

- sentence and instruction generation;
- answer construction/tap order;
- replays and scoring;
- current architecture and Memo behavior;
- cave visual design except compatibility fixes supported by evidence.

### Interpretation boundary

No audio or clipped controls means invalid product delivery, not poor auditory memory.

---

## 6. יער התמונות / Image Forest

### Purpose

Visual-spatial location memory.

### Current mechanic

A grid briefly reveals selected cells. The cells disappear, and the child reconstructs the set of locations by tapping.

### Current difficulty dimensions

- grid grows from 3×3 to 5×5;
- target-cell count grows from 2 toward 7;
- view duration reduces from about 3000 ms toward 1500 ms.

### Experience language

Lush layered forest, framed observation moments, leaves and landmarks, with a calm exploratory rhythm.

### Protected behavior

- cell generation and uniqueness;
- unordered set checking;
- grid size, exposure, and response rules;
- scoring and progression.

### Interpretation boundary

The task samples visual-spatial reconstruction under a particular grid and timing. It does not measure all visual memory.

---

## 7. הרי התבניות / Pattern Mountains

### Purpose

Pattern recognition, rule detection, and sequence completion.

### Current mechanic

A repeating sequence combines shapes and colors. The child selects the next token from alternatives.

### Current difficulty dimensions

- pattern period grows from 2 toward 4;
- number of shown tokens grows from 3 toward 7;
- distractors can share partial shape/color features.

### Experience language

Structured mountain trails, geometric motifs, repeated landmarks, and a clever/challenging mood without worksheet framing.

### Protected behavior

- generated base pattern;
- next-token derivation;
- option count and checking;
- scoring and progression.

### Interpretation boundary

This is rule completion in the implemented stimulus family, not a general reasoning or IQ measure.

---

## 8. מסלול הזריזות / Speed Track

### Purpose

Fast visual matching and processing under a playful race metaphor.

### Current mechanics

- Match a target symbol to an identical option.
- Higher levels increase options from 3 toward 5.
- Daily Journey includes a separate timed speed activity.

### Experience language

Curved track, checkered cues, forward energy, and clear target hierarchy. Speed feedback remains positive; no shame or threat.

### Protected behavior

- symbol matching;
- option-count progression;
- Daily Journey timer and score until separately redesigned;
- scoring and progression.

### Interpretation boundary

Response time is meaningful only with accuracy, task difficulty, input usability, and device performance. Faster but less accurate is not automatically improvement.

---

## 9. טירת האוצר / Treasure Castle

### Purpose

List encoding, ordered recall, and culmination/reward.

### Current mechanic

A list of familiar Hebrew items is exposed for a limited duration, disappears, and is reconstructed in order from shuffled tiles.

### Current difficulty dimensions

- list length grows from 3 toward 7;
- view duration reduces from about 4000 ms toward 2000 ms.

### Experience language

Aspirational castle, treasure, warm gold, and a special climactic atmosphere. It should feel earned, not like a final exam.

### Protected behavior

- item bank selection;
- ordered reconstruction;
- exposure timing;
- current progression and reward flow.

### Interpretation boundary

Performance reflects a specific list, exposure, and reconstruction format. It does not establish general long-term-memory ability.

---

# Part II — Future world specification

## 10. כביש הזיכרון / Memory Road

**Status:** Approved future concept; do not implement yet.  
**Working Hebrew names:** `כביש הזיכרון` or `דרך הזיכרון`  
**Final name:** Requires product approval before implementation.

### 10.1 Product purpose

Practice self-paced encoding, chunked visual number memory, and later reconstruction through a believable driving adventure.

The child and Memo are driving. A vehicle ahead carries a realistic Israeli-style eight-digit vehicle number. The interaction models a useful pause and chunk structure without becoming a license-plate test or a visible speed challenge.

### 10.2 Non-negotiable number format

The registration number is always **eight digits**.

Do not begin at three or four digits. The real-world remembering challenge is present from the first encounter; accessibility comes from internal structure and sequence complexity.

Always display and recall as:

```text
3 - 2 - 3
```

Example:

```text
555 - 28 - 111
```

Recall scaffold:

```text
_ _ _ - _ _ - _ _ _
```

The formatting is a deliberate chunking model, not decoration.

### 10.3 Core loop

```text
SEE VEHICLE
    ↓
PAUSE
    ↓
ENCODE 3-2-3 CHUNKS
    ↓
"I'M READY"
    ↓
OVERTAKE
    ↓
RETRIEVE
    ↓
CONTINUE DRIVING
```

Detailed sequence:

1. A vehicle becomes meaningfully visible ahead.
2. The child looks for as long as needed. There is no visible timer.
3. Memo subtly looks at the first, second, and third chunk.
4. CTA concept: `זכרתי, אפשר לעקוף!`
5. On tap, Memo's car overtakes naturally.
6. The original vehicle remains behind on the road; it does not vanish artificially.
7. The child reconstructs all eight digits in the same `3-2-3` structure.
8. Feedback resolves the attempt and driving continues.

### 10.4 Hidden encoding measurement

Measure, behind the scenes:

`encoding_duration_ms`

Start only when the number is meaningfully visible and stable. Stop when the child selects “I'm ready.” Pause/cancel the sample if the app backgrounds, the plate is obscured, layout changes invalidate visibility, or the interaction is interrupted.

The child never sees the timer. Speed is not rewarded.

The useful question is:

> At this sequence complexity, how long did the child choose to encode, and what was subsequent recall performance?

Do not infer impulsivity or memory strength from one duration.

### 10.5 Difficulty model

Length never changes. Difficulty changes through sequence complexity.

Potential dimensions:

- number of unique digits;
- total repetition;
- repetition position and symmetry;
- repeated runs within a chunk;
- relationships across chunks;
- alternating patterns;
- chunk distinctiveness;
- similarity/confusability of neighboring chunks.

Examples:

- Earlier: `555 - 28 - 111`
- Later: `583 - 27 - 416`

Unique-digit count alone is insufficient. Two sequences with equal unique-digit counts can differ greatly in pattern and chunk complexity.

### 10.6 Initial progression hypothesis

Current Level C product hypothesis:

> After approximately seven successful vehicles at the current complexity, increase complexity slightly.

Rules:

- count successes, not mere exposures;
- one mistake does not erase previous successes;
- one error does not automatically lower difficulty;
- aided, replayed, and independent success must not be silently treated as equivalent;
- exact thresholds and regression rules remain Beta questions;
- do not introduce several difficulty dimensions at once in the first implementation.

### 10.7 Memo behavior

Memo models chunking by subtly moving attention:

```text
first chunk → second chunk → third chunk
```

No arrows, numbered tutorial, or “chunking lesson.” The behavior should be visible but not distracting. During recall, Memo may enter `THINKING`; after success he performs exactly two small hops.

### 10.8 Response design

The response surface preserves `3-2-3`. Digits 0–9 remain available. Input should feel like reconstructing a remembered plate, not completing a school form.

Requirements:

- large child-friendly touch targets;
- clear RTL/LTR isolation for digits;
- no plate visible during recall;
- correction/backspace before submission;
- no speed score;
- no penalty animation that implies memory damage.

### 10.9 Later variants—not initial implementation

- more vehicles over a shorter period;
- delayed recall after longer driving;
- “remember the blue vehicle's number”;
- interference from a second vehicle.

These variants must not enter the initial implementation and must not combine multiple new difficulty dimensions at once.

### 10.10 Data direction—not implementation authorization

Conceptual fields for a future privacy/data review:

- sequence and complexity version;
- chunk-structure descriptors;
- meaningful visibility start/end;
- encoding duration;
- recalled digits and positional accuracy;
- help/replay level;
- structured vs Free Play context;
- valid/invalid technical status;
- spaced encounter relation.

Do not add analytics or persistence fields without an approved schema and privacy review.

### 10.11 Initial acceptance criteria

- Every plate has exactly eight digits.
- Presentation and recall always preserve `3-2-3`.
- No visible timer or speed reward.
- Overtaking is spatially believable; the other vehicle remains behind.
- Recall begins only after the child chooses readiness.
- Memo models the three chunks without lecturing.
- Difficulty changes by sequence complexity, not length.
- One error does not erase progression.
- Task works in Hebrew RTL on supported portrait mobile/PWA viewports.
- Claims remain task-specific.

---

## 11. עיר הקשרים / City of Connections

**Status:** Approved future concept; do not implement yet.  
**English name:** `City of Connections`  
**Core domain:** Multiplication-fact fluency through retrieval, spacing, derived-fact strategies, confidence, and long-term mastery.

### 11.1 Product purpose

The child builds a city by retrieving or deriving multiplication facts. Knowledge becomes construction, and repeated stable learning makes the same city richer over weeks.

It must not feel like “100 multiplication exercises.”

### 11.2 Core metaphor

```text
empty land
  → foundations
  → walls
  → buildings
  → bridges
  → neighborhoods
  → connected city
```

Desired child feeling:

> I built this.

Use **guided building with choice**, not free Minecraft-style construction.

### 11.3 Why guided building

A full voxel/free-building engine would add camera control, arbitrary placement, collision, persistence, asset, and interaction complexity unrelated to the learning goal.

Preferred implementation direction:

- staged SVG or PNG/WebP layers;
- CSS and small purposeful animations;
- predesigned building stages;
- limited meaningful choices;
- stable touch interactions and low mobile cost.

This is a direction for a later architecture review, not a library mandate.

### 11.4 Core construction loop

Example fact:

```text
7 × 8
```

Child retrieves or derives:

```text
56
```

Then creates and places an answer block:

```text
FACT
  → RETRIEVE / DERIVE
  → CREATE BLOCK
  → PLACE BLOCK
  → BUILD CITY
```

The construction consequence should make the answer meaningful without masking accuracy feedback.

### 11.5 Answer input as construction

The core response must not feel like a calculator keypad.

Provide digit bricks 0–9. For `7 × 8`, show:

```text
[_][__]
```

The child selects or drags `5` and `6`, forming:

```text
[5][6]
```

The combined `56` block becomes part of the wall/building.

### 11.6 Retrieval vs recognition

All digits 0–9 should remain available when the intent is retrieval. Showing only four or five possible digits changes the task toward recognition/guessing.

If a future accessibility mode changes the option set, record it as a different support level and do not compare it with independent retrieval as though equivalent.

### 11.7 Fact states

Every multiplication fact conceptually has three child-safe states:

| Internal state | Child language | Meaning |
|---|---|---|
| `DISCOVERING` | מגלים את הדרך | New or not yet established |
| `STRENGTHENING` | מחזקים את הדרך | Retrieval/strategy is developing across encounters |
| `FLUENT` | הדרך כבר מוכרת | Stable direct retrieval across separated encounters |

One correct answer is not fluency. A forgotten fluent fact does not destroy construction; it returns to spaced practice and may move to a strengthening state under an approved rule.

### 11.8 Direct and derived retrieval

Both outcomes are legitimate.

Direct retrieval:

```text
7 × 8 → 56
```

Derived retrieval using a known anchor:

```text
7 × 7 = 49
49 + 7 = 56
```

Strategy-assisted success is not failure. It should remain distinguishable from independent direct retrieval so growth toward fluency can be observed.

### 11.9 Strategy families

Memo may help the child exploit relationships with facts the child has actually demonstrated as known:

- **Commutativity:** `7 × 8 = 8 × 7`
- **Doubles:** from `4 × 6 = 24` to `8 × 6 = 48`
- **Fives:** from `5 × 7 = 35` to `6 × 7 = 42`
- **Tens:** from `10 × 8 = 80` to `9 × 8 = 72`
- **Neighbor facts:** from `7 × 7` to `7 × 8`

An anchor should not be called “known” after one success. Anchor selection requires a transparent, validated stability rule.

### 11.10 Graded help ladder

Do not reveal the answer immediately.

| Help level | Support |
|---:|---|
| 0 | Independent retrieval |
| 1 | `רוצה למצוא דרך דרך משהו שאתה כבר יודע?` |
| 2 | Show a genuinely established anchor, e.g. `7 × 7 = 49` |
| 3 | Show the transformation, e.g. `49 + 7` |
| 4 | Complete the answer together only if still needed |

Store help level internally when implemented. Do not score supported success as failure, and do not silently classify it as direct fluency.

### 11.11 Building reward system

Avoid one identical brick forever. A possible staged mapping:

- first successful encounter → foundation/basic block;
- later spaced retrieval → reinforced block or added detail;
- stable fluent fact → wall segment or architectural feature;
- group of established facts → floor, building, or neighborhood.

The mapping should reward sustained learning without making construction a literal neural measurement.

A forgotten fact never destroys a building. The city never collapses.

### 11.12 Child design choice

After several blocks, offer limited choices such as:

- round window;
- balcony with plants;
- tower with flag;
- roof style;
- bridge style.

Choices select among prebuilt variants. They create ownership without requiring free placement, camera logic, or a separate construction game.

### 11.13 Long-term progression

Do not create an unrelated new building every day. The same city develops over weeks:

```text
foundation
  → first house
  → tower
  → bridge
  → park
  → station
  → neighborhood
  → city
```

City state must be additive, durable, and migratable before implementation.

### 11.14 Time measurement

Measure response time behind the scenes, starting when the fact and valid response surface are meaningfully available.

Do not display:

- a stopwatch;
- “too slow”;
- red speed feedback;
- a child-facing speed score.

Interpret time only with accuracy, fact difficulty, strategy/help, spacing, prior mastery, and technical validity. Faster plus less accurate is not improvement.

### 11.15 Spacing

Do not drill:

```text
7×8 → 7×8 → 7×8 → 7×8
```

Prefer:

```text
7×8
  → other fact
  → other activity
  → later 7×8
  → another-day 7×8
```

Fluency classification requires stable direct retrieval across separated, comparable encounters.

### 11.16 Future Parent Mode

Prefer fact-level context:

```text
7×8
- currently strengthening
- often solved using 7×7 + 7
```

Potential parent information:

- fluent facts under an explicit stability rule;
- strategy-assisted facts;
- facts still developing or unstable;
- change over time at comparable conditions;
- strategy patterns;
- whether direct retrieval increases;
- whether retrieval remains stable after spacing.

Do not reduce this to “Multiplication score: 63%.” Do not call a developing fact a defect.

### 11.17 Daily Journey role

Once implemented and activated, City of Connections contributes one short multiplication activity to Daily Journey.

Possible future selection priority:

1. spaced fact due for retrieval;
2. strengthening fact;
3. new fact connected to a stable anchor;
4. occasional fluent fact to confirm retention.

This order is a product direction requiring scheduler and data-model design; it is not implemented now.

### 11.18 Data direction—not implementation authorization

Conceptual fact-level record:

- fact identity and commutative relation;
- encounter time/context;
- answer digits and accuracy;
- response time;
- help level and anchor used;
- direct vs derived retrieval;
- spacing interval;
- fact state and state-rule version;
- construction reward issued;
- technical validity and app build.

This requires a new persistence/cloud/privacy design and must not be inserted into the current `SaveState` without an approved migration.

### 11.19 Initial acceptance criteria

- The experience feels like building a city, not completing worksheets.
- Input uses all digits 0–9 for genuine retrieval.
- Answer digits combine into one construction block.
- Direct and strategy-assisted retrieval are both valid and separately recorded.
- Help is graded and does not reveal the answer immediately.
- Fluency requires stable spaced retrieval, not one success.
- Response time is hidden and never used alone.
- Buildings are never destroyed by mistakes or forgetting.
- Limited choices create ownership without free-building complexity.
- The same city grows across weeks.
- Parent language remains fact-level, contextual, and non-diagnostic.

---

## 12. Future implementation gates

Neither future world may enter implementation until all of the following are approved:

1. final name and place in world order;
2. typed engine and stimulus design;
3. difficulty model and Level C hypotheses;
4. Daily Journey selection and duration impact;
5. Free Play behavior;
6. persistence schema and migration;
7. telemetry/privacy boundary;
8. child and parent language;
9. accessibility and Hebrew RTL behavior;
10. mobile/PWA performance budget;
11. test plan including trial validity;
12. claim review against `MEMOLAND_COGNITIVE_FRAMEWORK.md`.

Until then, the current six-world `LandId`, scheduler, progression, and persistence model remain unchanged.

---

**End of MemoLand Worlds Specification v1.0**
