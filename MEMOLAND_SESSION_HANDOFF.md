# MemoLand Session Handoff

Last verified: 2026-08-21. This is the recommended first technical read for a fresh Codex session.

## A. Repository and Git State

- Repository: `ulalaoya/MemoLand`
- Remote: `https://github.com/ulalaoya/MemoLand.git`
- Active development branch for this handoff: `redesign-ui-v1`
- Tracking branch: `origin/redesign-ui-v1`
- Current redesign HEAD before this handoff commit: `b5e1cbe47bf3e35ebda9de7f15e26e1553d0cb05` (`Fix Echo Cave mobile viewport compatibility`)
- `main` / `origin/main` HEAD: `52dd51f74ca7817e7fca7e0333abb691d8966346`
- Tags: none.
- The isolated `redesign-ui-v1` worktree used for this handoff was clean before this file was created.

Local workspace warning: the original checkout was found on `memoland-gauntlet-v1` with unrelated uncommitted Wave 1 work. Do not stage, discard, reset, or mix those files into `redesign-ui-v1`. Use a clean `redesign-ui-v1` checkout/worktree.

Git safety rules:

- Work only on `redesign-ui-v1`.
- Do not touch `main`.
- Do not merge and do not create a PR unless explicitly requested.
- Never force-push.
- Push only intentional, tested commits to `origin/redesign-ui-v1`.
- Before each sprint, confirm branch, remote, status, and the files in scope.

## B. Deployment State

### Production — GitHub Pages

- URL: https://ulalaoya.github.io/MemoLand/
- Production is driven only by pushes to `main` through `.github/workflows/deploy.yml`.
- Workflow: Node 20, `npm ci`, `npm run build`, upload `dist`, deploy with GitHub Pages Actions.
- Production branch/HEAD at handoff: `main` at `52dd51f`.

### Beta — Netlify

- URL: https://memoland-beta.netlify.app/
- Netlify project: `memoland-beta`
- GitHub repository: `ulalaoya/MemoLand`
- Production deploy branch for this Netlify project: `redesign-ui-v1`
- Build command: `npm run build`
- Publish directory: `dist`
- Pushes to `redesign-ui-v1` auto-deploy the Beta. At inspection time, the Netlify deploy was non-manual and `ready`.
- Application-code commit deployed and inspected before this documentation-only handoff commit: `b5e1cbe47bf3e35ebda9de7f15e26e1553d0cb05`. Netlify may subsequently report the handoff commit as its newest deploy even though that commit changes documentation only.

Beta and Production are isolated: `redesign-ui-v1` updates Netlify Beta; `main` updates GitHub Pages Production. Do not merge the branches or change either deployment configuration as part of an ordinary feature/bug sprint.

## C. Source-of-Truth Documents

Read these first, after this handoff:

- `MEMOLAND_DESIGN_BIBLE.md` — authoritative visual, interaction, responsive, accessibility, architecture, and Git-safety rules.
- `MEMOLAND_PRODUCT_BIBLE.md` — authoritative product vision, Memo role, reward/progress principles, Daily Journey direction, and Child/Parent boundaries.
- `MEMOLAND_COGNITIVE_FRAMEWORK.md` — scientific evidence levels, measurement limits, adaptive rules, and forbidden claims.
- `MEMOLAND_WORLDS_SPEC.md` — authoritative registry and detailed specifications for all implemented and future worlds; this is the only consolidated detailed world-spec file currently present.

Useful secondary references:

- `README.md` — local commands, GitHub Pages workflow, PWA install notes, and architecture overview.
- `CONTENT.md` — existing content-extension routes for parents and developers.
- `DECISIONS.md` — early architecture decisions; treat newer Bible documents and current code as authoritative where this older file is stale.
- `PLAN.md` — early delivery/validation record; useful history, not the current roadmap.
- `vite.config.ts` and `.github/workflows/deploy.yml` — actual PWA and production deployment configuration.

Do not duplicate or rewrite the Bible documents during implementation. Cite the relevant rule and inspect only the needed section.

## D. Product Vision Summary

MemoLand is a Hebrew-first RTL memory adventure for approximately ages 7–11: game first, educational/cognitive product second. Its emotional pillars are capability, curiosity, and achievement. Memo is a memory companion who models pausing, attending, encoding, retrieving, and celebrating rather than lecturing. The child-facing metaphor is that practice helps the brain build new pathways and connections; it is motivational, not a biological measurement. Mistakes never erase earned progress or define the child.

## E. Current Worlds

### Implemented Worlds

| World | Internal ID | Primary focus | Status and major files |
|---|---|---|---|
| עמק המספרים / Numbers Valley | `numbers` | Forward/backward/sorted digit span and running mental arithmetic | Implemented; `src/engines/numbers.ts`, `src/components/games/DigitSpanGame.tsx`, `ChainMathGame.tsx`, `NumbersValleyChallenge.tsx`, `numbers-valley-challenge.css`, `src/components/svg/Backgrounds.tsx` |
| מערת ההדים / Echo Cave | `echoes` | Auditory sequence memory and multi-step listening | Implemented, with an unresolved device compatibility bug; `src/engines/echoes.ts`, `echoesContent.ts`, `ListenRepeatGame.tsx`, `MultiStepGame.tsx`, `EchoCaveChallenge.tsx`, `EchoAudioState.tsx`, `EchoDiagnosticsPanel.tsx`, `src/audio/speech.ts` |
| יער התמונות / Image Forest | `forest` | Visual-spatial location reconstruction | Implemented; `src/engines/forest.ts`, `src/components/games/GridGame.tsx` |
| הרי התבניות / Pattern Mountains | `patterns` | Pattern/rule completion | Implemented; `src/engines/patterns.ts`, `src/components/games/PatternGame.tsx` |
| מסלול הזריזות / Speed Track | `speed` | Fast visual matching | Implemented; `src/engines/speed.ts`, `src/components/games/QuickMatchGame.tsx`, `SpeedMatchGame.tsx` |
| טירת האוצר / Treasure Castle | `castle` | Ordered list encoding and reconstruction | Implemented; `src/engines/castle.ts`, `src/components/games/MemorizeGame.tsx`, `src/screens/TreasureScreen.tsx` |

All ten engines are registered in `src/engines/index.ts`; `src/components/games/GameHost.tsx` maps engine IDs to UI components. The comment in `src/engines/index.ts` saying only worlds 1–2 are fully implemented is stale; the registry and world specification confirm all six are playable.

### Future / Specified but Not Implemented Worlds

- כביש הזיכרון / Memory Road — approved specification only; no `LandId`, engine, UI, scheduler, or persistence implementation.
- עיר הקשרים / City of Connections — approved specification only; no `LandId`, multiplication model, city UI, scheduler, or persistence implementation.

Do not add either future world without a separately approved sprint, data migration, claim review, and validation plan.

## F. Numbers Valley Current State

Numbers Valley has a complete immersive visual redesign while preserving the existing engines, scoring, progression, timing, and response logic. The valley now has believable foreground-to-horizon path perspective, landscape layers, a reusable challenge shell, large number presentation, focus/encoding/recall states, keypad response, limited replay, and Memo behavior integrated with the memory phase. Memo becomes attentive during encoding, thinking during recall, and celebrates success.

Primary files:

- `src/components/games/NumbersValleyChallenge.tsx`
- `src/components/games/numbers-valley-challenge.css`
- `src/components/games/DigitSpanGame.tsx`
- `src/components/games/ChainMathGame.tsx`
- `src/components/svg/Backgrounds.tsx`
- `src/screens/SessionScreen.tsx`
- Protected logic: `src/engines/numbers.ts`, `src/config/curriculum.ts`

Relevant commits: `4d7674b` (gameplay redesign), `6f52d58` (Memo behavior language), `d065443` (memory interaction polish), `0243dc4` (path perspective correction).

## G. Echo Cave Current State

Echo Cave has an immersive cave challenge shell and a general flow of Ready → Playing/listening → Recall/response → Success/done, plus a recoverable audio-error state. Memo is integrated into the cave floor and changes behavior with the cognitive phase. Listen-and-repeat reconstructs word order; multi-step asks for ordered visual taps. Replays are limited.

Audio lifecycle work already present:

- opening-screen user gesture unlocks speech;
- stale speech is canceled before retry/unmount;
- synthesis is resumed and Hebrew voices are refreshed;
- utterances are retained until callbacks fire;
- the cognitive phase waits for confirmed speech start/end rather than enqueue alone;
- an 8-second start watchdog detects silent failure;
- technical failure shows a retry state and diagnostics rather than recording a cognitive attempt;
- diagnostics include browser, viewport, PWA/service-worker, speech voices/events, and Web Audio state.

Primary files:

- `src/components/games/EchoCaveChallenge.tsx`
- `src/components/games/echo-cave-challenge.css`
- `src/components/games/ListenRepeatGame.tsx`
- `src/components/games/MultiStepGame.tsx`
- `src/components/games/EchoAudioState.tsx`
- `src/components/games/EchoDiagnosticsPanel.tsx`
- `src/audio/speech.ts`, `src/audio/sfx.ts`
- `src/diagnostics/deviceDiagnostics.ts`
- Protected logic/content: `src/engines/echoes.ts`, `src/engines/echoesContent.ts`

Relevant commits: `7fccf7a` (audio reliability), `2e4531d` (immersive gameplay), `89c9058` (world/Memo integration), `c6d5c6d` (attention polish), `4917e62` (Samsung diagnostics and audio hardening), `b5e1cbe` (dynamic viewport compatibility).

The flow is believed to work generally and does work on at least one real phone. It is not considered device-complete because the same Beta build still fails on the child's Samsung device; see the known bugs below.

## H. Opening Screen, Map, and HUD

Opening screen:

- Premium landscape/adventure artwork with local `public/opening-hero-v2.webp`, restrained light/orb motion, compact branding, and a single “tap to start” gesture that unlocks audio.
- Shows the active player's name when available. Avatar choice persists in the profile and appears in the map HUD; the opening hero itself remains Memo artwork.
- Major files: `src/screens/StartTapScreen.tsx`, `src/components/opening/OpeningAdventureScene.tsx`, `src/components/opening/opening-screen.css`.

Map:

- Redesigned vertical adventure route with atmosphere, route/checkpoints, six illustrated world cards, active-world emphasis, per-world track progress, and a fixed Daily Journey banner.
- Major files: `src/screens/MapScreen.tsx`, `src/components/world/LandCard.tsx`, `WorldMapPath.tsx`, `WorldMapAtmosphere.tsx`, `WorldIllustrations.tsx`, `DailyJourneyBanner.tsx`, `world-map.css`.

HUD:

- Shows player identity/avatar/hat/rank, MemoLand identity, coins, decorative map hearts, rank progress, and achievements/collections/parent actions.
- Major files: `src/components/world/PlayerHUD.tsx`, `PlayerIdentity.tsx`, `src/config/collectibles.ts`.

Key shell commits: `b62cd29` (design system), `d2ac220`/`d115a9b`/`e0c1b03`/`98a4c80` (HUD, map, illustrations, Daily Journey banner), `9625c14` (opening), `cb87019` (HUD/world polish).

## I. Memo Behavior System

The reusable implementation is `src/components/games/MemoCompanion.tsx` with `src/components/games/memo-companion.css`.

- `IDLE` (`idle`) — calm, safe, available companionship.
- `ATTENTIVE` (`attentive`) — becomes still and focuses on visual information.
- `LISTENING` (`listening`) — orients toward sound and listens quietly.
- `THINKING` (`thinking`) — shows gentle retrieval effort.
- `SUCCESS` (`success`) — shared delight.

Permanent rule: `SUCCESS` is exactly two small hops. The CSS animation `ml-memo-two-hops` currently implements those two hops. Preserve reduced-motion behavior.

## J. Current Daily Journey Implementation

Actual code path:

- `src/scheduler/session.ts` creates the plan with `buildDailySession`.
- `src/scheduler/activities.ts` materializes it into game/reveal/quiz/speed activities.
- `src/screens/SessionScreen.tsx` runs activities, scoring, retries, rewards, spaced items, and completion.
- `src/config/curriculum.ts` holds difficulty, spacing, and reward parameters.

Current seven-step plan:

1. two easier warmups in an observed stronger world;
2. expose a spoken delayed-recall story;
3. include one due spaced item when available;
4. rotate across two lower-observed-accuracy worlds plus one stronger world;
5. run a 60-second speed activity;
6. ask up to two delayed-recall questions;
7. finish with two easier activities in the warmup world.

The setting offers 10/15/20/25 minutes (default 20), which changes rotation rounds to 4/6/8/10. However, actual completion is points-driven: `DAILY_GOAL` is 1000, extra activities may be appended until the goal or a 70-activity cap, and `finalize` records the configured minutes rather than measured elapsed time. Free Play currently runs five activities in one selected world. Wrong game answers retry the same exercise with a new seed and a progressively easier level; session hearts can open a revive prompt, but earned progress is not erased.

Future approved direction—do not describe it as current: approximately 6–9 minutes, one short meaningful activity from every active world, varied safe order, then Free Play. Future parent interpretation must keep Ability (structured performance), Preference (free choice), and Growth (comparable longitudinal change) separate.

## K. Current Persistence and State

- Persistence is browser `localStorage`, schema version 1.
- Profile registry: `memoland.profiles.v1`.
- Per-profile save: `memoland.save.v1.<profileId>`.
- Stores profiles, settings, coins/rank, exercise aggregates, land/track progress, collectibles, streak/daily points, spaced items, local parent content, and history.
- Writes use a 200 ms debounce; export/import/reset are local JSON operations.
- Primary files: `src/state/persistence.ts`, `src/state/store.ts`, `src/state/rewards.ts`, `src/types.ts`.

There is no backend, account authentication, remote database, cloud synchronization, or cross-device sync. Data is tied to the browser origin/device. Parent Mode/cloud synchronization is not implemented.

## L. Current Parent / Child Model

### Current

- Child experience is the same local React SPA: local profile selection, opening, map, Daily Journey/Free Play, treasure, collections, and achievements.
- A local Parent Dashboard exists at `src/screens/ParentDashboard.tsx`; it uses a four-digit local PIN (default `1234` is currently printed on the gate), then shows aggregate progress, content entry, settings, voice selection, export/import, and reset.
- This is a convenience gate, not authenticated Parent Mode. It does not support remote parent access or child-device linkage.

### Future Approved Direction — Not Implemented

- Child Mode with no normal login friction or sensitive analytics.
- Authenticated Parent Mode with parent identity and linked child profiles.
- Carefully contextualized parent progress views with Ability, Preference, and Growth separated.
- Offline child play plus secure cloud sync, conflict/migration rules, privacy, export, retention, and deletion controls.

This future architecture requires a dedicated product, privacy, backend, authentication, and migration sprint.

## M. Future World: Memory Road

Approved specification only; not implemented. See `MEMOLAND_WORLDS_SPEC.md`.

- Realistic vehicle-number scenario while the child and Memo drive.
- Always eight digits, always grouped `3-2-3`.
- Chunking is modeled by Memo rather than taught as a lecture.
- Encoding duration is hidden; the child looks as long as needed and chooses “ready.”
- The car overtakes; the original vehicle remains spatially behind; recall starts after the overtake.
- The child reconstructs all eight digits in `3-2-3` form.
- Difficulty increases through reduced repetition and higher sequence/chunk complexity, never shorter/longer plate length.
- Current product hypothesis: increase complexity slightly after approximately seven successes at the current complexity; this is not a validated rule.
- No visible timer, speed reward, or implementation authorization.

## N. Future World: City of Connections

Approved specification only; not implemented. See `MEMOLAND_WORLDS_SPEC.md`.

- Multiplication-fact fluency through retrieval, derived facts, spacing, confidence, and long-term construction.
- Guided staged building—not a Minecraft/free-building engine; one city develops over weeks.
- Digit bricks 0–9 construct the answer and become a building block.
- Direct retrieval and strategy-assisted/derived retrieval are both valid but must remain distinguishable.
- Fact states: `DISCOVERING`, `STRENGTHENING`, `FLUENT`; fluency requires stable spaced direct retrieval, not one correct response.
- Memo may use established related facts (commutativity, doubles, fives, tens, neighbors) through a graded help ladder.
- No visible speed pressure or child-facing stopwatch.
- Forgotten facts return to practice; buildings never break or disappear.

## O. Scientific Guardrails

- Retrieval practice: preserve a genuine attempt after information disappears; distinguish retrieval from recognition.
- Spacing: prefer separated comparable encounters over massed repetition; current intervals are product parameters, not clinically optimal.
- Chunking: organize information into meaningful units; it does not create unlimited capacity.
- Attention/encoding: ensure the stimulus is reliably available before response; technical failure is not child failure.
- Metacognition: readiness time is contextual and meaningful only across repeated comparable trials.
- Neuroplasticity: pathways/connections are an additive motivational metaphor, not measured neural change.
- Near/far transfer: task improvement and closely related transfer require direct evidence; do not generalize to broad ability.

Forbidden claims include: increases IQ, measures new neural pathways, cures attention or memory problems, makes a child generally smarter, or guarantees school improvement. Read `MEMOLAND_COGNITIVE_FRAMEWORK.md` before changing a cognitive task, metric, or claim.

## P. Current Known Beta Bugs

The same Netlify Beta build has produced different real-device behavior:

- On one real phone, Echo audio works and Memo positioning works.
- On the child's Samsung device, Echo audio fails, the retry/error screen appears, and Memo becomes clipped near the bottom.
- Confirm the exact Samsung model, OS, browser, and installation mode; do not assume them.

Classification:

- **P0 — Echo audio device/PWA compatibility.** The failing device cannot reliably deliver the auditory stimulus, so no cognitive result is valid there.
- **P1 — viewport / Memo clipping.** Memo is clipped near the bottom on the failing device.

No root cause has been proven. Do not report either bug as fixed merely because `4917e62` and `b5e1cbe` added diagnostics and viewport hardening.

## Q. Device Compatibility Investigation Plan

The next implementation sprint should reproduce on the exact failing device and capture the existing diagnostic bundle before changing code. Inspect:

- `userAgent`, detected browser/version, exact Samsung model/OS, and browser vs installed PWA;
- `innerWidth`/`innerHeight`, `visualViewport` size/offsets, `devicePixelRatio`, screen/available dimensions;
- standalone display mode, service-worker controller/scope/state, app build ID/time, and cached PWA version;
- `speechSynthesis` availability/state, Hebrew voice list and `localService`, utterance queued/start/end/error events;
- audio activation from the opening user gesture, synthesis resume/cancel behavior, and `AudioContext`/Web Audio state where relevant;
- `vh` versus `dvh`/`svh`/`lvh`, Android navigation bar, safe-area insets, font/display scaling, absolute positioning, flex min-height, and overflow clipping.

Relevant diagnostics/layout files: `src/diagnostics/deviceDiagnostics.ts`, `src/audio/speech.ts`, `src/audio/sfx.ts`, `src/main.tsx`, `src/index.css`, `src/components/games/echo-cave-challenge.css`, and `src/screens/session-screen.css`.

## R. Test / Validation Baseline

Verified on clean `redesign-ui-v1` at `b5e1cbe` on 2026-08-21:

- Automated tests: **37/37 pass** across three files (23 engine, 11 scheduler, 3 device-diagnostics tests).
- Test command: `npm test` (Vitest).
- Build command: `npm run build` (`tsc --noEmit && vite build`).
- Production build: pass; PWA `generateSW` pass with 40 precache entries.
- Design validation matrix: 320, 375, 390, 430, and 768 px widths; primary portrait target is approximately 375–430 px.
- `PLAN.md` explicitly records a browser flow at 375 px with RTL and no horizontal overflow. The documentation task did not rerun the full responsive browser matrix.
- PWA generation, immediate-update flags, and build IDs exist. Real-device Echo/audio/viewport compatibility is not validated because of the Samsung failure.
- Current Workbox glob covers `js`, `css`, `html`, `svg`, `png`, and `woff2`; `webp` is not in the glob, so offline availability of `opening-hero-v2.webp` must be verified rather than assumed.

## S. Application Architecture and First Code Reads

Architecture is a local-first React 18 + Vite + TypeScript SPA with screen state in `src/App.tsx` rather than a router.

Read code in this order for a targeted sprint:

1. `src/App.tsx` — screen/state flow.
2. `src/types.ts` — shared contracts and persistence shape.
3. `src/config/lands.ts` and `src/engines/index.ts` — world and engine registries.
4. `src/screens/SessionScreen.tsx` — Daily Journey/Free Play runtime.
5. `src/scheduler/session.ts` and `src/scheduler/activities.ts` — journey planning/materialization.
6. `src/state/store.ts` and `src/state/persistence.ts` — local state and storage.
7. Only the active sprint's component, engine, CSS, audio, or diagnostics files.

Directory roles:

- `src/engines/` — challenge generation and answer checking, independent of presentation.
- `src/components/games/` — game renderers and immersive world shells.
- `src/screens/` — top-level application screens and session orchestration.
- `src/scheduler/` — leveling, spacing, recommendations, and journey construction.
- `src/state/` — persistence, rewards, profiles, progression, and settings.
- `src/audio/` — speech synthesis and sound effects.
- `src/design/` and `src/components/world/` — tokens, motion, map, cards, HUD, and world art.
- `src/diagnostics/` — real-device/PWA diagnostic collection.

## T. Protected / High-Risk Areas

Do not casually change:

- `src/engines/**`
- `src/scheduler/**`
- `src/state/**`
- `src/types.ts`
- `.github/workflows/deploy.yml`, `vite.config.ts`, production deployment, or Netlify settings
- PWA/service-worker configuration and audio lifecycle
- progression, scoring, rewards, retry/hearts, difficulty, persistence, or migrations

Changes here require an explicit product or proven bug rationale, current-vs-target behavior, migration/claim review where relevant, focused tests, build/PWA validation, and real-device validation proportional to risk.

## U. Most Important Commits

Chronological redesign milestones:

1. `b62cd29` — established the MemoLand design system.
2. `d2ac220`, `d115a9b`, `e0c1b03`, `98a4c80` — added the player HUD, map route, world illustrations, and Daily Journey banner.
3. `fdc0f22`, `9625c14`, `cb87019` — added the Design Bible, premium opening, and polished HUD/world atmosphere.
4. `7fccf7a`, `2e4531d`, `89c9058`, `c6d5c6d` — made Echo audio reliable, immersive, integrated with Memo, and behaviorally polished.
5. `4d7674b`, `6f52d58`, `d065443`, `0243dc4` — redesigned Numbers Valley, added Memo's reusable behavior language, polished memory interaction, and corrected perspective.
6. `599cb90`, `cd4f6c0` — added the authoritative Product/Cognitive framework and future-world specifications.
7. `4917e62`, `b5e1cbe` — added Samsung/PWA diagnostics, hardened Echo audio, and added dynamic viewport compatibility; these commits did not prove the Samsung bugs fixed.

## V. Current Next-Step Priority

1. Confirm the exact failing Samsung model, OS, browser/PWA mode, app build, and reproducible steps.
2. Capture and compare the existing diagnostics on the working and failing phones.
3. Fix Echo audio on the failing device with the smallest evidence-backed change; preserve trial-validity behavior.
4. Fix Memo viewport clipping with the smallest evidence-backed layout change.
5. Run working-phone + failing-Samsung regression, responsive widths, browser/PWA mode, tests, build, and service-worker validation.
6. Only after compatibility is closed, choose the next feature sprint.
7. Candidate: Daily Journey architecture.
8. Candidate: Parent/Child architecture.
9. Candidate: Memory Road.
10. Candidate: City of Connections.

# Codex Efficiency Rules

- Avoid broad repository scans when targeted inspection is enough.
- Search with `rg` before opening large files.
- Do not reread Git history or full Bible files after the relevant rule is already loaded.
- Inspect only components, engines, styles, and tests relevant to the active sprint.
- Avoid unrelated refactors and speculative fixes.
- Reuse existing architecture and components rather than rebuilding them.
- Batch related read-only and validation commands where safe.
- Keep implementation progress and final reports concise.
- Preserve existing tested behavior and use small logical commits.
- Stop immediately after the requested scope is complete.

# Instructions for a Fresh Codex Session

1. Read `MEMOLAND_SESSION_HANDOFF.md`.
2. Read the source-of-truth Bible documents referenced above; use targeted sections after the first read.
3. Run `git status`, `git branch -vv`, and `git fetch origin`.
4. Confirm a clean `redesign-ui-v1` checkout tracking `origin/redesign-ui-v1`; do not disturb unrelated work in another checkout.
5. Do not re-audit the entire repository unless the requested sprint requires it.
6. Inspect only files relevant to the requested sprint.
7. Preserve existing tested behavior and authoritative product/design/scientific rules.
8. Use small logical commits.
9. Push only to `origin/redesign-ui-v1`; never force-push.
10. Do not touch or merge `main`, and do not create a PR unless explicitly requested.
11. Validate proportionally: focused tests, full 37-test baseline, build/PWA, responsive UI, then affected real devices.
12. Stop after the requested sprint.
