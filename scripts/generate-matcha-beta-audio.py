from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path


UTTERANCES = (
    ("listen-repeat-beta-01.wav", "הילד מצא תפוח אדום", "hajˈeled matsˈa tapˈuaχ ʔadˈom"),
    ("listen-repeat-beta-02.wav", "סבתא ראתה פרח צהוב", "savtˈa ʁaʔatˈa pˈeʁaχ tsahˈov"),
    ("listen-repeat-beta-03.wav", "הציפור בנתה קן קטן", "hatsipˈoʁ bantˈa kˈen katˈan"),
    (
        "listen-repeat-beta-04.wav",
        "ממו הביא כדור גדול לגינה",
        "mˈemo hevˈi kadˈuʁ ɡadˈol laɡinˈa",
    ),
    (
        "listen-repeat-beta-05.wav",
        "הילדה קראה ספר מצחיק בערב",
        "hajaldˈa kaʁʔˈa sˈefeʁ matsχˈik baʔˈeʁev",
    ),
    (
        "listen-repeat-beta-06.wav",
        "הארנב מצא גזר גדול ליד העץ",
        "haʔˈaʁnav matsˈa ɡˈezeʁ ɡadˈol lejˈad haʔˈets",
    ),
    (
        "listen-repeat-beta-07.wav",
        "הכלב מצא כדור אדום מתחת לספסל בגינה",
        "hakˈelev matsˈa kadˈuʁ ʔadˈom mitˈaχat lasafsˈal baɡinˈa",
    ),
    (
        "listen-repeat-beta-08.wav",
        "סבתא הכינה עוגת שוקולד לנכדים אחר הצהריים",
        "savtˈa heχˈina ʔuɡˈat ʃˈokolad laneχadˈim ʔaχˈaʁ hatsohoʁˈajim",
    ),
    (
        "listen-repeat-beta-09.wav",
        "ממו שם בקבוק מים בתוך התיק לפני הטיול",
        "mˈemo ʃˈam bakbˈuk majˈim betˈoχ hatˈik lifnˈej hatijˈul",
    ),
    (
        "listen-repeat-beta-10.wav",
        "הילדה אספה שלוש צדפות עם אחותה על החוף בבוקר",
        "hajaldˈa ʔasfˈa ʃalˈoʃ tsdafˈot ʔˈim ʔaχotˈa ʔˈal haχˈof babˈokeʁ",
    ),
    (
        "listen-repeat-beta-11.wav",
        "סבתא שתלה פרחים צבעוניים ליד העץ בגינה ביום שישי",
        "savtˈa ʃatlˈa pʁaχˈim tsivʔonijˈim lejˈad haʔˈets baɡinˈa bejˈom ʃiʃˈi",
    ),
    (
        "listen-repeat-beta-12.wav",
        "הילד החזיר את הספר למדף העליון בספרייה אחרי השיעור",
        "hajˈeled heχzˈiʁ ʔˈet hasˈefeʁ lamadˈaf haʔeljˈon basifʁijˈa ʔaχaʁˈej haʃiʔˈuʁ",
    ),
    (
        "story-picnic.wav",
        "ממו יצא לפיקניק עם החברים. הוא לקח סל עם שלושה תפוחים, בקבוק מים וכדור אדום. הם ישבו מתחת לעץ גדול ושיחקו כל הבוקר.",
        "mˈemo jatsˈa lepˈiknik ʔˈim haχaveʁˈim. hˈu lakˈaχ sˈal ʔˈim ʃloʃˈa tapuχˈim, bakbˈuk majˈim veχadˈuʁ ʔadˈom. hˈem jaʃvˈu mitˈaχat leʔˈets ɡadˈol vesiχakˈu kˈol habˈokeʁ.",
    ),
    ("story-picnic-question-1.wav", "כמה תפוחים ממו לקח?", "kˈama tapuχˈim mˈemo lakˈaχ?"),
    ("story-picnic-question-2.wav", "איזה צבע היה הכדור?", "ʔˈejze tsˈeva hajˈa hakadˈuʁ?"),
    ("story-picnic-question-3.wav", "איפה הם ישבו?", "ʔejfˈo hˈem jaʃvˈu?"),
    (
        "story-beach.wav",
        "טיפת המים הלכה לים בבוקר. היא בנתה ארמון חול עם ארבעה מגדלים ודגל כחול למעלה. אחר כך היא אספה חמש צדפות יפות.",
        "tipˈat hamˈajim halχˈa lajˈam babˈokeʁ. hˈi bantˈa ʔaʁmˈon χˈol ʔˈim ʔaʁbaʔˈa miɡdalˈim vedˈeɡel kaχˈol lemˈaʔla. ʔaχˈaʁ kˈaχ hˈi ʔasfˈa χamˈeʃ tsdafˈot jafˈot.",
    ),
    ("story-beach-question-1.wav", "כמה מגדלים היו לארמון?", "kˈama miɡdalˈim hajˈu laʔaʁmˈon?"),
    ("story-beach-question-2.wav", "איזה צבע היה הדגל?", "ʔˈejze tsˈeva hajˈa hadˈeɡel?"),
    ("story-beach-question-3.wav", "כמה צדפות היא אספה?", "kˈama tsdafˈot hˈi ʔasfˈa?"),
)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate MemoLand's temporary full-utterance Matcha beta corpus.")
    parser.add_argument("--tool-dir", type=Path, required=True, help="Directory containing matcha-he-en.onnx and matcha_onnx")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "public" / "audio" / "echo-hebrew",
    )
    args = parser.parse_args()

    tool_dir = args.tool_dir.resolve()
    model_path = tool_dir / "matcha-he-en.onnx"
    if not model_path.is_file():
        raise FileNotFoundError(f"Missing local Matcha model: {model_path}")

    sys.path.insert(0, str(tool_dir))
    import soundfile as sf
    from matcha_onnx import MatchaOnnx

    if len(UTTERANCES) != 20 or len({filename for filename, _, _ in UTTERANCES}) != 20:
        raise RuntimeError("The beta corpus must contain exactly 20 unique output files")

    args.output_dir.mkdir(parents=True, exist_ok=True)
    tts = MatchaOnnx(model_path, steps=8)
    for filename, requested_text, phonemes in UTTERANCES:
        samples, sample_rate = tts.create(
            phonemes,
            is_phonemes=True,
            speed=1.05,
            temperature=0.667,
            steps=8,
        )
        if sample_rate != 22_050:
            raise RuntimeError(f"Unexpected Matcha sample rate for {filename}: {sample_rate}")
        output_path = args.output_dir / filename
        sf.write(output_path, samples, sample_rate, subtype="PCM_16")
        print(
            json.dumps(
                {
                    "filename": filename,
                    "text": requested_text,
                    "phonemes": phonemes,
                    "sampleRate": sample_rate,
                    "channels": 1,
                    "durationSeconds": round(len(samples) / sample_rate, 3),
                    "sha256": hashlib.sha256(output_path.read_bytes()).hexdigest(),
                },
                ensure_ascii=False,
            )
        )


if __name__ == "__main__":
    main()
