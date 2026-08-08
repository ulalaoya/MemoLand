# MemoLand Design Bible

**Version:** 1.0  
**Purpose:** Permanent visual, UX and implementation reference for all MemoLand redesign work  
**Primary audience:** Product/design review + Codex implementation  
**Language:** Hebrew-first, RTL  
**Target users:** Children approximately ages 7-11

---

# 1. Product Vision

MemoLand is a memory-training adventure game.

It must feel like a real mobile game first, and an educational product second.

The experience should communicate:

- adventure
- progression
- curiosity
- achievement
- joy
- mastery
- confidence

MemoLand should never feel like:

- a school worksheet
- a corporate dashboard
- a generic educational app
- a preschool product
- a flat web interface
- a collection of unrelated AI-generated illustrations

The visual goal is a coherent, polished, colorful adventure-game world with original characters and environments.

---

# 2. Core Design Principles

## 2.1 Game first

Every screen should feel like part of one continuous game world.

Prefer:

- illustrated environments
- progression paths
- characters
- checkpoints
- rewards
- layered depth
- animated feedback

Avoid:

- plain white cards on empty backgrounds
- generic dashboard tiles
- unnecessary form-like UI
- excessive text
- overly flat components

## 2.2 Mature enough for ages 7-11

The visual language may be playful and colorful, but should not feel baby-like.

Use:

- vivid colors
- strong silhouettes
- polished cartoon styling
- clear hierarchy
- richer environments
- restrained use of cute expressions

Avoid:

- pastel baby palettes
- nursery-style illustrations
- excessive smiley faces
- overly rounded everything
- childish sticker sheets

## 2.3 Original adventure-game language

The product may draw inspiration from colorful platform-adventure games in terms of energy, pacing, depth and game feel.

Do not copy:

- copyrighted characters
- recognizable branded assets
- specific proprietary layouts
- iconic game symbols in a way that creates confusion

MemoLand must maintain its own world, characters and visual identity.

## 2.4 Presentation changes must not alter logic

The redesign is primarily a presentation layer.

Do not alter core game behavior unless a specific bug-fix task explicitly requires it.

Protected areas by default:

- `src/engines/**`
- `src/scheduler/**`
- `src/state/**`
- `src/types.ts`
- persistence behavior
- scoring
- progression
- scheduler
- spaced repetition
- rewards
- stored profile structure
- world availability logic

---

# 3. Brand

## 3.1 Name

**MemoLand**

## 3.2 Brand idea

A world made of memory challenges.

Each cognitive skill is represented as a distinct land in one larger adventure.

## 3.3 Tone

The product voice should be:

- encouraging
- energetic
- concise
- playful
- clear
- never patronizing

## 3.4 Hebrew-first

The app is Hebrew-first and RTL.

All UI must be checked visually in RTL, not merely translated.

---

# 4. Brand Color Palette

## Core palette

| Token | HEX | Purpose |
|---|---|---|
| `--ml-blue` | `#2E8DF6` | primary UI / sky accents |
| `--ml-sky` | `#67C8FF` | sky / light backgrounds |
| `--ml-green` | `#58C548` | nature / success / active |
| `--ml-green-light` | `#91E35D` | highlights / grassy accents |
| `--ml-yellow` | `#FFC928` | rewards / coins / attention |
| `--ml-red` | `#F04A3A` | energy / challenge |
| `--ml-orange` | `#F59D2A` | CTA accents / warmth |
| `--ml-purple` | `#8C52D9` | Daily Journey / special states |
| `--ml-earth` | `#8D5B36` | ground / environmental support |
| `--ml-navy` | `#243247` | strong readable text |
| `--ml-white` | `#FFFFFF` | borders / surfaces / contrast |
| `--ml-surface` | `#F7FBFF` | soft neutral surface |

Supporting shades may be added only when derived from this palette.

Do not introduce unrelated accent colors without design review.

---

# 5. Typography

Existing project fonts should remain the core font system.

## 5.1 Fonts

### Lilita One
Use for:

- logo/game accents
- large decorative numerals
- occasional level titles
- short highly playful labels

Do not use for long Hebrew text.

### Rubik
Primary UI font.

Use for:

- buttons
- headings
- HUD labels
- world names
- CTA text
- progress labels
- profile name

Preferred weights:

- 600
- 700
- 800

### Assistant
Use for:

- explanations
- helper text
- longer instructions
- secondary copy

## 5.2 Consistency rule

A component must never introduce a visually unrelated font.

The Daily Journey banner, profile chip, world cards and opening CTA must all follow the same typography system.

---

# 6. Shape Language

## 6.1 Corners

Use rounded corners, but not excessively.

Recommended ranges:

- compact chip: 14-18px
- buttons: 16-22px
- cards: 20-28px
- large banners: 24-32px

## 6.2 Borders

Use clean, confident borders.

Typical game treatment:

- white outer border
- colored inner stroke
- subtle shadow

Avoid overly thin 1px web-app borders for primary game surfaces.

## 6.3 Shadows

Use soft dimensional shadows to make components feel tactile.

Prefer:

- short downward shadows
- subtle ambient depth
- colored shadow variants when appropriate

Avoid:

- heavy blurred dashboard shadows
- realistic drop shadows that clash with cartoon art

---

# 7. Motion Language

Motion should make the world feel alive, not distract from the task.

## Allowed motion

- slow cloud drift
- gentle logo float
- star twinkle
- subtle character bounce
- character wave
- checkpoint pulse
- coin rotation
- light leaf movement
- tree sway
- water shimmer
- button press compression
- available-world breathing
- soft route glow

## Rules

- keep movement subtle
- never animate every element simultaneously
- no heavy animation libraries unless explicitly approved
- prefer CSS animations
- respect `prefers-reduced-motion`
- animation must never block input
- animation must never affect cognitive task timing unless intentionally designed

---

# 8. Environmental Visual Style

MemoLand should feel like a world, not a set of cards floating over a gradient.

Use layered scenes.

Recommended structure:

1. sky / distant atmosphere
2. distant hills / mountains
3. midground scenery
4. gameplay route / cards
5. foreground grass / stones / flowers / props

Use:

- clouds
- hills
- trees
- bushes
- flowers
- rocks
- paths
- crystals
- water
- castles
- signs
- environmental props

Each world should be visually recognizable even before reading its name.

---

# 9. The Six Worlds

The current project contains six lands.

Their identity and order must be preserved according to existing application data.

## 9.1 עמק המספרים - Numbers Valley

**Skill:** number memory / working memory

Visual cues:

- green valley
- sunny outdoor environment
- winding path
- large colorful 1-2-3
- cheerful open landscape

Primary mood:

- bright
- accessible
- first-adventure feeling

## 9.2 מערת ההדים - Echo Cave

**Skill:** auditory memory / sequential listening

Visual cues:

- deep purple-blue cave
- glowing crystals
- sound waves
- echo rings
- blue cave character where appropriate

Primary mood:

- mysterious
- magical
- focused

## 9.3 יער התמונות - Image Forest

**Skill:** visual memory

Visual cues:

- lush forest
- framed scenic image
- leaves
- visual motifs
- layered greenery

Primary mood:

- observant
- exploratory
- rich

## 9.4 הרי התבניות - Pattern Mountains

**Skill:** patterns / logic / sequence recognition

Visual cues:

- purple-blue mountains
- square
- circle
- triangle
- repeating motifs
- geometric trails

Primary mood:

- clever
- structured
- challenging

## 9.5 מסלול הזריזות - Speed Track

**Skill:** processing speed

Visual cues:

- curved racetrack
- stopwatch
- checkered flag
- motion lines
- energetic directional cues

Primary mood:

- fast
- energetic
- focused

## 9.6 טירת האוצר - Treasure Castle

**Skill:** advanced recall / culmination

Visual cues:

- fantasy castle
- treasure chest
- gold
- glow
- aspirational final-stage atmosphere

Primary mood:

- rewarding
- special
- climactic

---

# 10. Opening Screen

The opening screen should feel like a real game title screen.

## Must include

- MemoLand logo
- one primary MemoLand character
- current player name when available
- strong game CTA
- adventure landscape
- subtle motion

Suggested greeting:

`ברוך הבא, [שם]!`

Fallback:

`ברוך הבא!`

Suggested CTA:

`הקש כדי להתחיל`

## Do not use

- sticker collage layout
- old legacy look
- generic login UI
- unrelated fonts

The initial interaction must continue supporting browser audio unlock behavior.

---

# 11. Player Profile Entry

Do not use a generic button labeled:

`התחבר`

Instead use a compact game-profile chip.

Example:

`[Avatar] גלי`

The chip should:

- show current avatar
- show current player name
- preserve existing navigation behavior
- remain visually part of the HUD

Do not add authentication logic.

---

# 12. Player HUD

The HUD should feel like a game HUD, not a web header.

## May contain

- avatar
- player name
- coins
- rank
- rank progress
- today progress
- hearts
- settings/action controls

## Important semantic rules

- coins are persisted real state
- rank progress is derived from coins
- do not label rank progress as XP unless a real XP system is later implemented
- today progress represents today's points versus daily goal
- decorative map hearts must not be silently converted into gameplay lives

## Style

Use:

- compact grouped surfaces
- strong icons
- clear numeric emphasis
- subtle depth
- readable labels
- balanced spacing

---

# 13. World Map

The map is a primary emotional screen in the game.

## Layout

- vertical adventure path
- alternating world cards left/right
- visually connected checkpoints
- clear route progression
- mobile-first
- full sense of journey

## It must not look like

- a list
- a dashboard
- a grid of cards
- a menu page

## Route

Use CSS/SVG.

The route should:

- remain behind clickable elements
- scale responsively
- visually connect worlds
- include checkpoint nodes
- highlight the current/active checkpoint
- never interfere with touch targets

---

# 14. World Cards

World cards are level destinations.

Each card should display, where available:

- world number
- world name
- existing description/focus
- existing progress
- existing availability state
- world illustration
- visual theme color

## Behavior

All availability must come from current application logic.

Never introduce artificial locks based on mockups, old README text or visual assumptions.

## Style

Cards should feel:

- tactile
- game-like
- illustrated
- dimensional
- easy to tap

Avoid:

- dashboard panel appearance
- flat white cards
- tiny illustrations
- excessive text

---

# 15. Daily Journey Banner

Hebrew label:

`המסע של היום`

This is a primary CTA.

## Visual direction

- purple base
- game-like dimensionality
- white outer border
- adventure/map/compass visual
- optional memory/brain motif
- strong readable Rubik typography
- consistent with the rest of the app

Do not introduce a separate font.

The banner must preserve existing Daily Journey logic and callback behavior.

---

# 16. World Illustrations

World illustrations should share one coherent visual language.

Preferred characteristics:

- polished cartoon look
- dimensional lighting
- clear silhouette
- readable at small sizes
- richer than simple icons
- lightweight enough for mobile

Avoid:

- inconsistent rendering styles
- photorealism
- sticker-sheet appearance
- unrelated AI-art styles
- overly complex detail that disappears at small sizes

When using raster art:

- prefer PNG/WebP
- export appropriately for mobile
- maintain transparent backgrounds when needed
- avoid embedding text inside artwork unless absolutely necessary

When using SVG/CSS:

- keep components lightweight
- maintain clean shapes
- avoid overly primitive flat symbols

---

# 17. Buttons

Primary buttons should feel tactile.

## Primary CTA

Use:

- strong saturated fill
- rounded shape
- readable bold Rubik
- white or dark high-contrast text
- subtle game shadow
- press animation

## Secondary CTA

Use:

- lower visual emphasis
- still clearly tappable
- consistent border and radius language

## Minimum touch target

44px.

Prefer larger for child users.

---

# 18. Progress Indicators

Progress should feel rewarding.

Use:

- chunky readable bars
- rounded ends
- clear fill state
- world or reward colors
- subtle inset/highlight effect

Do not overuse thin dashboard-style progress bars.

Never mislabel data.

---

# 19. Audio UX

MemoLand includes sound/speech-driven experiences.

Audio must work across supported desktop and mobile browsers where browser APIs permit.

Important considerations:

- user gesture may be required to unlock audio
- `AudioContext` may start suspended
- `speechSynthesis` voices may load asynchronously
- mute/settings state must be respected
- no silent failure

When audio fails:

1. identify root cause
2. apply smallest safe fix
3. preserve architecture
4. report browser limitation if relevant

---

# 20. Responsive Rules

Primary target:

- portrait mobile
- approximately 375-430px width

Must also be checked at:

- 320px
- 375px
- 390px
- 430px
- 768px

## Requirements

- no horizontal overflow
- no clipped CTA
- no card overlap
- no HUD overflow
- readable Hebrew
- route stays coherent
- 44px minimum touch targets
- safe-area support
- opening character must not obscure text

Desktop may keep the existing central mobile-style content shell if that is architecturally safer.

---

# 21. Accessibility

MemoLand is visual and playful, but accessibility still matters.

Requirements:

- adequate text contrast
- clear touch targets
- no important information conveyed only by color
- visible focus states where applicable
- reduced-motion support
- readable font sizes
- avoid long blocks of instructions

---

# 22. React / Implementation Architecture

Current application architecture should remain stable.

Presentation components should be separated from state and behavior.

Preferred pattern:

- screen owns data/callbacks
- presentation components receive props
- visual theme driven by typed config
- minimal direct coupling to store from leaf components

Recommended design structure:

```text
src/
├── design/
│   ├── tokens.css
│   ├── typography.css
│   ├── motion.css
│   └── themes.ts
│
├── components/
│   └── world/
│       ├── PlayerHUD.tsx
│       ├── LandCard.tsx
│       ├── DailyJourneyBanner.tsx
│       ├── WorldMapPath.tsx
│       └── WorldIllustrations.tsx
```

Do not introduce a new router or state library during visual redesign.

Do not refactor unrelated files merely for cleanliness.

---

# 23. Design Tokens

All new visual components should use shared tokens where practical.

Token categories should include:

- color
- typography
- radius
- shadow
- spacing
- motion
- z-index
- safe area

Avoid duplicating arbitrary values across components.

---

# 24. Visual Consistency Checklist

Before completing any UI task, verify:

- same font system
- same border-radius language
- same shadow language
- same border treatment
- consistent icon scale
- consistent CTA hierarchy
- consistent spacing
- consistent world colors
- clear Hebrew hierarchy
- no unrelated visual style
- no accidental dashboard look

---

# 25. Git Safety

All redesign work must remain isolated until explicitly approved.

Current redesign branch:

`redesign-ui-v1`

Default safety rules:

- never commit directly to `main`
- never push directly to `main`
- never merge into `main` without explicit instruction
- never force-push
- never change default branch
- never alter GitHub Pages or production deployment settings unless explicitly requested
- do not create or merge a PR unless explicitly requested

Use small logical commits.

---

# 26. Validation Requirements

After UI implementation:

- run `npm run build`
- run existing tests
- confirm TypeScript passes
- confirm Vite production build passes
- confirm PWA build succeeds
- inspect console
- test target widths
- test RTL visually
- test interactions
- test audio when relevant

Any failure introduced after a previously clean baseline should be treated as a regression until proven otherwise.

---

# 27. Definition of Done for a Screen

A screen is not complete just because it compiles.

It is complete only when:

- visually consistent with MemoLand
- feels like a game
- preserves logic
- responsive
- tested in RTL
- no console errors
- no regression
- build passes
- interactions remain intact
- design review approved

---

# 28. Creative Review Standard

When choosing between:

A. simpler implementation that looks like generic web UI  
B. slightly richer presentation that clearly feels like MemoLand

Prefer B, as long as performance and maintainability remain sound.

The product should aim for:

**"A child wants to open it because it looks like a game."**

Not:

**"A parent recognizes it as a learning tool."**

Both matter, but the child-facing game experience comes first.

---

# 29. Current Redesign Priorities

The immediate visual priorities are:

1. opening screen redesign
2. richer world-map atmosphere
3. stronger world illustrations
4. game-like HUD
5. profile chip instead of generic `התחבר`
6. consistent Daily Journey typography
7. environmental motion
8. Echo Cave audio reliability
9. design review before expanding to all gameplay screens

---

# 30. Codex Instruction Rule

For future implementation tasks:

1. read this file first
2. follow the design rules in this file
3. preserve current architecture and behavior
4. implement only the requested Sprint scope
5. do not continue to unrelated screens without explicit instruction
6. report any conflict between this document and existing application behavior before changing core logic

---

**End of MemoLand Design Bible v1.0**
