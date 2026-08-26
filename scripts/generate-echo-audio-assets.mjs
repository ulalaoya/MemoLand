/**
 * Development-only generator for the compact built-in Hebrew Echo fallback corpus.
 *
 * Install @echogarden/espeak-ng-emscripten outside the application, then pass its
 * module directory as the first argument. The committed WAV files are runtime-only;
 * eSpeak is not shipped in the PWA and the Hebrew corpus never leaves the machine.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const moduleDirectory = process.argv[2];
if (!moduleDirectory) throw new Error('Pass the @echogarden/espeak-ng-emscripten module directory');
const invocationDirectory = process.cwd();
const outputDirectory = path.resolve(invocationDirectory, process.argv[3] ?? 'public/audio/echo-hebrew');

process.chdir(moduleDirectory);
const { default: createESpeakModule } = await import(pathToFileURL(path.join(moduleDirectory, 'espeak-ng.js')));
const Module = await createESpeakModule();
const worker = new Module.eSpeakNGWorker();
worker.set_voice('Hebrew', 'he');
worker.rate = 155;
worker.pitch = 52;

const subjects = ['הילד', 'הכלב', 'החתול', 'סבתא', 'הדג', 'הציפור', 'ממו', 'הארנב'];
const verbs = ['אכל', 'ראה', 'מצא', 'אהב', 'צייר', 'שמר', 'הביא', 'חיפש'];
const objects = [
  'תפוח אדום',
  'כדור גדול',
  'ספר כחול',
  'פרח צהוב',
  'עוגה מתוקה',
  'כובע ירוק',
  'מטבע זהב',
  'בית קטן',
];
const extras = ['בגינה', 'בבוקר', 'ליד הים', 'בשמחה', 'מתחת לעץ', 'בערב'];
const icons = [
  ['star', 'כוכב'],
  ['flower', 'פרח'],
  ['sun', 'שמש'],
  ['heart', 'לב'],
  ['moon', 'ירח'],
  ['cloud', 'ענן'],
  ['tree', 'עץ'],
  ['fish', 'דג'],
  ['apple', 'תפוח'],
];
const stories = [
  [
    'story-picnic',
    'ממו יצא לפיקניק עם החברים. הוא לקח סל עם שלושה תפוחים, בקבוק מים וכדור אדום. הם ישבו מתחת לעץ גדול ושיחקו כל הבוקר.',
    ['כמה תפוחים ממו לקח?', 'איזה צבע היה הכדור?', 'איפה הם ישבו?'],
  ],
  [
    'story-beach',
    'טיפת המים הלכה לים בבוקר. היא בנתה ארמון חול עם ארבעה מגדלים ודגל כחול למעלה. אחר כך היא אספה חמש צדפות יפות.',
    ['כמה מגדלים היו לארמון?', 'איזה צבע היה הדגל?', 'כמה צדפות היא אספה?'],
  ],
];

function numbered(group, values) {
  return values.map((text, index) => [`${group}-${String(index + 1).padStart(2, '0')}.wav`, text]);
}

function corpus() {
  const clips = [
    ...numbered('subject', subjects),
    ...numbered('verb', verbs),
    ...numbered('object', objects),
    ...numbered('extra', extras),
    ...icons.map(([id, label]) => [`step-first-${id}.wav`, `גע ב${label}`]),
    ...icons.map(([id, label]) => [`step-next-${id}.wav`, `אחר כך ב${label}`]),
  ];
  for (const [storyId, text, questions] of stories) {
    clips.push([`${storyId}.wav`, text]);
    clips.push(...questions.map((question, index) => [`${storyId}-question-${index + 1}.wav`, question]));
  }
  return clips;
}

function synthesize(text) {
  const chunks = [];
  worker.synthesize(text, (audio) => {
    if (audio.length) chunks.push(audio);
    return false;
  });
  const sampleCount = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const samples = new Int16Array(sampleCount);
  let offset = 0;
  for (const chunk of chunks) {
    samples.set(chunk, offset);
    offset += chunk.length;
  }
  return samples;
}

function encodeWave(samples, sampleRate) {
  const dataLength = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataLength);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  for (let index = 0; index < samples.length; index += 1) buffer.writeInt16LE(samples[index], 44 + index * 2);
  return buffer;
}

const clips = corpus();
if (clips.length !== 56 || new Set(clips.map(([name]) => name)).size !== clips.length) {
  throw new Error('Echo fallback corpus must contain 56 unique clips');
}

await mkdir(outputDirectory, { recursive: true });
for (const [index, [name, text]] of clips.entries()) {
  const target = path.join(outputDirectory, name);
  const samples = synthesize(text);
  await writeFile(target, encodeWave(samples, worker.samplerate));
  console.log(`[${String(index + 1).padStart(2, '0')}/${clips.length}] ${target}`);
}
