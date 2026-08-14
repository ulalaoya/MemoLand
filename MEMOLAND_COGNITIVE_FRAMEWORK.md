# MemoLand Cognitive Framework

**Version:** 1.0  
**Status:** Authoritative scientific-interpretation and claims reference  
**Audience:** Product, research, design, engineering, and parent-experience teams

This framework translates cognitive-science principles into conservative MemoLand product rules. It is not a clinical protocol and does not authorize diagnosis, treatment, or broad cognitive claims.

---

## 1. Evidence levels

Every scientific or behavior-oriented product statement should be classified before it reaches a child, parent, interface, marketing page, or metric definition.

| Level | Meaning | Product use |
|---|---|---|
| **A — Strong evidence** | Replicated principle or convergent high-quality evidence under relevant conditions | May guide product design; claims must still match the studied outcome and context |
| **B — Supported / context-dependent** | Evidence exists, but effect depends materially on task, learner, implementation, or measurement | May guide a hypothesis or feature with explicit conditions and validation |
| **C — MemoLand product hypothesis** | Plausible design hypothesis not yet established for this product or child population | May be tested in Beta; must be labeled internally as a hypothesis |
| **D — Do not claim** | Unsupported, overbroad, diagnostic, clinical, or not measurable from MemoLand data | Must not appear as a product promise or inferred child trait |

Evidence levels apply to the **specific claim**, not to a topic in general. For example, “retrieval practice can improve later retention of practiced material” can be Level A, while “this game raises general intelligence” remains Level D.

---

## 2. Core functional model

MemoLand uses this model to reason about task flow:

```text
ATTENTION
    ↓
ENCODING
    ↓
MAINTENANCE / ORGANIZATION
    ↓
RETRIEVAL
    ↓
RESPONSE
```

This is a functional design model, not a direct measurement pipeline.

### 2.1 Critical inference boundary

A failed answer does **not** identify the failed stage. The same incorrect response may reflect:

- divided or missed attention;
- incomplete encoding;
- working-memory load;
- weak organization or unfamiliar chunk structure;
- interference from other material;
- retrieval difficulty;
- misunderstanding of the instruction;
- input or motor error;
- audio, viewport, latency, or other product failure;
- fatigue, mood, motivation, or environmental distraction.

Therefore:

- do not label an error “attention failure” without direct evidence;
- do not infer a stable weakness from a small number of trials;
- do not compare performance across materially different task settings as though they were equivalent;
- treat technical failures as invalid trials, not cognitive outcomes.

---

## 3. Attention and encoding

### Scientific position

Information must be available to and selected by the learner before it can be usefully encoded. Product behavior can support this by reducing competing action, signaling the relevant source, and providing a meaningful preparation moment.

### MemoLand application

- Use a short natural pause before an encoding event.
- Let Memo orient toward the relevant visual or sound.
- Do not allow the response phase to begin before the stimulus is reliably presented.
- Keep visual motion restrained during the encoding interval.
- Avoid scolding language such as “you did not concentrate.”

### Evidence level

- General attention/encoding dependency: **A**.
- Memo modeling pause → child spontaneously adopts better encoding behavior: **C**, to observe in Beta.
- Fast response proves impulsivity: **D**.

---

## 4. Working memory

### Scientific position

Working memory is limited, but there is no universal rule that every person can remember exactly seven items. Capacity estimates depend on what counts as an item or chunk, prior knowledge, rehearsal, modality, interference, task method, stimulus structure, and development.

Research has often found limits closer to a small number of chunks under controlled conditions, but that is not a child-level score and not a fixed per-person constant.

### MemoLand difficulty rule

Difficulty must consider more than visible item count:

- number of chunks and elements;
- familiarity and semantic support;
- repetition and redundancy;
- similarity between items;
- order requirements;
- transformation requirements, such as reverse or sort;
- exposure duration;
- interference and delay;
- modality and input burden;
- support level and prior encounters.

Example: eight digits structured as `555 - 28 - 111` and eight unrelated digits are both length eight, but they are not equivalent stimuli.

### Evidence level

- Working memory is capacity-limited: **A**.
- “Exactly seven items” as a universal rule: **D**.
- One span result defines a child's general memory capacity: **D**.

---

## 5. Chunking

### Scientific position

Chunking organizes elements into units with meaningful internal relationships. It can make information easier to encode and maintain by changing its effective organization.

Chunking does not create unlimited capacity and should not be described as a magic expansion of memory.

### MemoLand application

- Prefer **experience first, name later** where a behavior can reveal grouping naturally.
- Preserve meaningful grouping visually during recall.
- Let Memo's gaze or posture model group boundaries without arrows or a lecture.
- Measure stimulus complexity, not only raw length.
- Avoid introducing many strategy dimensions simultaneously.

Memory Road's permanent `3-2-3` registration-number structure is a deliberate chunking model. The length stays eight; complexity changes inside and across chunks.

### Evidence level

- Organization into chunks supports performance under relevant conditions: **A/B**.
- The exact `3-2-3` design improves this child's real-world recall: **C**, requiring Beta observation.
- Chunking increases memory without practical limit: **D**.

---

## 6. Retrieval practice

### Scientific position

Retrieval is not only assessment. Attempting to retrieve previously encountered information can support later retention. This is among the strongest learning principles relevant to MemoLand when the claim is limited to the practiced or appropriately related material.

Preferred interaction pattern:

```text
ENCOUNTER
  → information disappears
  → child attempts retrieval
  → informative feedback
```

### MemoLand application

- Preserve a genuine retrieval interval; do not leave the answer visible.
- Distinguish retrieval from recognition. A tiny set of answer options may measure recognition or guessing rather than unaided recall.
- Feedback should follow the attempt without shame.
- A genuine attempt can be productively meaningful even when incorrect.
- Technical playback failure invalidates an auditory trial; do not advance to recall or record an attempt until playback reliably starts.

### Evidence level

- Retrieval practice supports later retention in many studied contexts: **A**.
- Retrieval benefits every possible skill or transfers broadly: **D**.
- A single failed retrieval shows failed encoding: **D**.

---

## 7. Spacing

### Scientific position

Repeated encounters distributed over time generally support longer-term retention better than the same repetitions massed together. Effective interval length depends on the desired retention interval and task conditions.

Avoid:

```text
same item → same item → same item → same item
```

Prefer:

```text
item
  → other activity
  → item later
  → item on another day
```

### MemoLand application

- Use short repeated encounters across activities and days.
- Retest at documented intervals instead of treating one success as stable mastery.
- Compare performance at similar difficulty and support.
- Do not punish forgetting after a delay; return the item to practice.
- Interpret longitudinal patterns more heavily than a perfect single session.

### Evidence level

- Distributed practice benefits retention in many verbal and educational tasks: **A**.
- One fixed interval schedule is optimal for every item and child: **D**.
- Current MemoLand interval values are clinically or scientifically optimal: **D**; they are product parameters requiring validation.

---

## 8. Metacognition and readiness

### Scientific position

Learners can make judgments about readiness or knowledge, but those judgments are fallible and context-dependent. A single readiness tap cannot establish self-awareness quality.

### MemoLand application

- Create opportunities for “Am I actually ready?” without showing a speed score.
- Store encoding/readiness time only as contextual behavioral data.
- Evaluate calibration only across repeated, comparable encounters.
- Do not reward faster readiness in a memory-encoding task.
- Do not create a child-facing “Metacognition Score.”

Possible research question:

> At this stimulus complexity, how long did the child choose to encode, and what was subsequent recall performance across repeated comparable trials?

### Evidence level

- Metacognitive judgments can relate imperfectly to later performance: **B**.
- Memory Road readiness behavior becomes better calibrated with repeated use: **C**.
- A few mismatched readiness judgments prove poor self-awareness: **D**.

---

## 9. Neuroplasticity and the brain-pathways metaphor

### Scientific position

Experience and practice are associated with changes in behavior and neural systems. MemoLand does not measure those changes. Its visual pathways are a motivational metaphor for learning and sustained practice.

### Product boundary

Allowed:

- “המוח שלי בונה מסלולים חדשים.”
- “בכל פעם שאני מתאמן, המוח שלי לומד ובונה קשרים חדשים.”
- additive lights, routes, and connections representing practice and discovery.

Not allowed:

- measured neural activity;
- measured synapses or hippocampal growth;
- brain health, strength, or power percentages;
- an MRI-like result;
- claims that the visualization is a biological measurement;
- subtractive imagery in which mistakes damage or darken a brain.

### Evidence level

- Learning involves changes in biological and functional systems: **A/B**, depending on the specific claim.
- MemoLand's illustrated pathway represents measured neural change: **D**.
- The metaphor improves motivation for this child: **C**, to observe.

---

## 10. Near and far transfer

### Definitions

- **Trained-task improvement:** better performance on the practiced task or close variants.
- **Near transfer:** improvement on a related but untrained task sharing important processes or structure.
- **Far transfer:** broad improvement in substantially different abilities or real-world outcomes.

### Scientific boundary

Evidence for working-memory and cognitive training is much more reliable for trained tasks than for broad far transfer. Reviews have found limited or no convincing general cognitive benefit once design quality and controls are considered.

MemoLand may investigate:

- trained-task improvement;
- related-task performance;
- strategy learning;
- encoding and retrieval behavior within MemoLand;
- persistence;
- spontaneous strategy use in new MemoLand contexts.

MemoLand must not claim that it:

- raises IQ;
- makes a child generally smarter;
- guarantees higher school grades;
- cures attention problems;
- improves every kind of memory;
- produces broad cognitive improvement.

### Evidence level

- Improvement on practiced tasks: **A/B**, depending on design and measurement.
- Transfer to closely related tasks: **B**, requiring direct testing.
- Broad intelligence, school, or clinical improvement: **D** until directly supported by appropriate independent evidence; not a current MemoLand claim.

---

## 11. Adaptive difficulty boundary

Adaptive difficulty should sustain useful challenge without converting noisy behavior into a hidden diagnosis.

### Safe inputs

- repeated accuracy at the same or comparable stimulus structure;
- response or encoding time interpreted with accuracy;
- help level;
- spacing interval;
- prior mastery of component material;
- repetition structure and unique-element count;
- recent technical validity of the trial.

### Unsafe shortcuts

- increasing or decreasing difficulty after one result;
- using speed alone as improvement;
- treating a retry after a technical error as a cognitive failure;
- comparing aided retrieval with independent retrieval as equivalent;
- collapsing different stimuli into a single “memory score”;
- silently lowering difficulty because the child made one mistake.

The Memory Road “approximately seven successes before a slight complexity increase” is a **Level C product hypothesis**, not a validated adaptive rule. A success count must not ignore help, spacing, or comparability.

---

## 12. Measurement and telemetry rules

### 12.1 Trial validity

A trial is cognitively interpretable only if the intended stimulus was reliably presented and the response opportunity was usable.

Mark a trial invalid or technical when, for example:

- speech synthesis was unavailable;
- audio never emitted a confirmed start event;
- required content was clipped or obscured;
- the app lost state before response;
- a service-worker mismatch caused incompatible UI/code state.

Invalid trials must not update cognitive performance or adaptation.

### 12.2 Minimum useful context

When future telemetry is implemented, a trial record should conceptually preserve:

- world and exercise;
- stimulus-structure parameters;
- difficulty level/version;
- exposure or encoding duration where meaningful;
- response duration;
- accuracy;
- help level and replay use;
- spacing since comparable encounter;
- structured Daily Journey vs Free Play context;
- technical validity and app build;
- no unnecessary device or personal identifiers.

This is a data-model direction, not authorization to add analytics or cloud collection.

### 12.3 Ability, preference, and growth

- **Ability** uses structured exposure at documented difficulty.
- **Preference** uses voluntary choice behavior.
- **Growth** uses longitudinal, comparable conditions.

Do not combine them into one score. Do not infer ability from Free Play selection frequency.

---

## 13. Scientific claim matrix

| Product statement or inference | Level | Decision |
|---|---:|---|
| Retrieval attempts can support later retention of practiced material | A | Allowed with scoped wording |
| Spacing encounters can support longer-term retention | A | Allowed with context |
| Working memory is limited | A | Allowed |
| Everyone remembers exactly seven items | D | Prohibited |
| Chunking organizes information into more manageable units | A/B | Allowed; do not promise unlimited capacity |
| A short natural pause may help this child encode before responding | C | Beta hypothesis |
| An incorrect answer reveals the failed cognitive stage | D | Prohibited |
| A fast answer proves impulsivity | D | Prohibited |
| Readiness time plus later recall may inform calibration over repeated comparable trials | B/C | Research use only |
| One readiness tap measures metacognition | D | Prohibited |
| Trained-task performance can improve with practice | A/B | Allowed if measured |
| MemoLand raises IQ or produces general intelligence gains | D | Prohibited |
| MemoLand treats attention problems | D | Prohibited |
| Brain-pathway art represents practice and learning | C motivational metaphor | Allowed with clear boundary |
| Brain-pathway art measures neural connections | D | Prohibited |
| A multiplication fact is fluent after one correct answer | D | Prohibited |
| Stable retrieval across separated encounters supports a fluency classification | B | Allowed with explicit operational definition |
| Strategy-assisted multiplication is a legitimate learning outcome | B | Allowed; store help separately from direct retrieval |
| Faster but less accurate multiplication is improvement | D | Prohibited |

---

## 14. Beta research questions

These are hypotheses to observe, not claims to market:

1. Does Memo's pause-and-attend behavior reduce premature responding over repeated use?
2. Does a child begin to use chunk structure without an explicit lecture?
3. Does self-paced encoding time become better calibrated to stimulus complexity?
4. Do retrieval attempts remain engaging when mistakes preserve progress and dignity?
5. Does rotating Daily Journey order reduce order/fatigue bias while preserving early capability?
6. Does first Free Play choice after structured exposure provide stable preference information?
7. Do direct and strategy-assisted multiplication retrieval become distinguishable over spaced encounters?

Any analysis must separate product usability failures from child performance.

---

## 15. Review checklist for a new cognitive feature

Before implementation:

1. What exact process is the interaction intended to exercise?
2. What observable behavior is collected?
3. Which alternative explanations remain?
4. What makes a trial technically valid?
5. Is the task retrieval, recognition, or a mixture?
6. Are complexity and help represented, not just item count and accuracy?
7. What is the evidence level of each intended claim?
8. Is any adaptive rule explicitly a hypothesis?
9. Are near and far transfer separated?
10. Could the child or parent mistake a metaphor for a measurement?

If these questions do not have clear answers, the feature is not ready.

---

## 16. Scientific references

The following sources inform the framework. They support scoped principles, not every MemoLand-specific product hypothesis.

- Cowan, N. (2001). *The magical number 4 in short-term memory: A reconsideration of mental storage capacity*. Behavioral and Brain Sciences, 24(1), 87–114. [doi:10.1017/S0140525X01003922](https://doi.org/10.1017/S0140525X01003922)
- Gobet, F., Lane, P. C. R., Croker, S., Cheng, P. C.-H., Jones, G., Oliver, I., & Pine, J. M. (2001). *Chunking mechanisms in human learning*. Trends in Cognitive Sciences, 5(6), 236–243. [doi:10.1016/S1364-6613(00)01662-4](https://doi.org/10.1016/S1364-6613(00)01662-4)
- Roediger, H. L., & Karpicke, J. D. (2006). *Test-enhanced learning: Taking memory tests improves long-term retention*. Psychological Science, 17(3), 249–255. [doi:10.1111/j.1467-9280.2006.01693.x](https://doi.org/10.1111/j.1467-9280.2006.01693.x)
- Karpicke, J. D., & Blunt, J. R. (2011). *Retrieval practice produces more learning than elaborative studying with concept mapping*. Science, 331(6018), 772–775. [doi:10.1126/science.1199327](https://doi.org/10.1126/science.1199327)
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). *Distributed practice in verbal recall tasks: A review and quantitative synthesis*. Psychological Bulletin, 132(3), 354–380. [doi:10.1037/0033-2909.132.3.354](https://doi.org/10.1037/0033-2909.132.3.354)
- Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). *Improving students' learning with effective learning techniques*. Psychological Science in the Public Interest, 14(1), 4–58. [doi:10.1177/1529100612453266](https://doi.org/10.1177/1529100612453266)
- Melby-Lervåg, M., Redick, T. S., & Hulme, C. (2016). *Working memory training does not improve performance on measures of intelligence or other measures of far transfer*. Perspectives on Psychological Science, 11(4), 512–534. [doi:10.1177/1745691616635612](https://doi.org/10.1177/1745691616635612)
- Sala, G., & Gobet, F. (2019). *Cognitive training does not enhance general cognition*. Trends in Cognitive Sciences, 23(1), 9–20. [doi:10.1016/j.tics.2018.10.004](https://doi.org/10.1016/j.tics.2018.10.004)

---

**End of MemoLand Cognitive Framework v1.0**
