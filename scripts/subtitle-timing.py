#!/usr/bin/env python3
"""
Generate subtitle-timing.json from audio-segments.json.

Modes:
  default  — split text by sentence boundaries, get real audio duration via ffprobe
  minimax  — read word-level timing from public/minimax-word-timing/ (exact alignment)

Usage:
  python3 scripts/subtitle-timing.py                    # default mode (ffprobe)
  python3 scripts/subtitle-timing.py --mode minimax     # MiniMax word-level timing
  python3 scripts/subtitle-timing.py --mode minimax --chapters t6-bill-gate,t6-role-shift  # specific chapters only
"""
import json, os, sys, subprocess, argparse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(SCRIPT_DIR, "..") if os.path.basename(SCRIPT_DIR) == 'scripts' else SCRIPT_DIR
SEGMENTS_FILE = os.path.join(ROOT, "audio-segments.json")
TIMING_FILE = os.path.join(ROOT, "public", "subtitle-timing.json")
WORD_TIMING_DIR = os.path.join(ROOT, "public", "minimax-word-timing")

# ── Config ──
MAX_CHARS = 55
MIN_MS_CHUNK = 2000

def split_text(text: str, max_chars: int = MAX_CHARS) -> list[str]:
    chunks, remaining = [], text
    while remaining:
        if len(remaining) <= max_chars: chunks.append(remaining); break
        cut = max_chars
        for sep in ["。", "！", "？"]:
            pos = remaining.rfind(sep, 0, max_chars)
            if pos > max_chars // 2: cut = pos + 1; break
        else:
            for sep in ["，", "；", "："]:
                pos = remaining.rfind(sep, 0, max_chars)
                if pos > max_chars // 3: cut = pos + 1; break
        chunks.append(remaining[:cut])
        remaining = remaining[cut:]
    return chunks

duration_cache = {}

def get_audio_duration(chapter: str, step: int) -> float:
    key = f"{chapter}/{step}"
    if key in duration_cache: return duration_cache[key]
    mp3_path = os.path.join(ROOT, "public", "audio", chapter, f"{step}.mp3")
    if not os.path.isfile(mp3_path): return 0
    try:
        result = subprocess.check_output(
            ['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
             '-of', 'csv=p=0', mp3_path], timeout=5).decode().strip()
        duration_cache[key] = float(result)
        return duration_cache[key]
    except: return 0

def generate_default(chapters_filter: list[str] | None = None):
    """Split text by sentence boundaries, use ffprobe for real duration"""
    with open(SEGMENTS_FILE) as f: segs = json.load(f)
    try:
        with open(TIMING_FILE) as f: timing = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        timing = {}

    targets = set(chapters_filter) if chapters_filter else {s['chapter'] for s in segs}

    used_ffprobe = used_estimate = 0

    for ch in targets:
        timing[ch] = {}
        for s in segs:
            if s['chapter'] != ch: continue
            step0 = str(s['step'] - 1)
            chunks = split_text(s['text'])
            real_dur = get_audio_duration(ch, s['step'])
            if real_dur > 0:
                total_ms = int(real_dur * 1000)
                used_ffprobe += 1
            else:
                total_ms = max(4000, int(len(s['text']) * 300))
                used_estimate += 1
            total_chars = sum(len(c) for c in chunks)
            timing[ch][step0] = []
            for c in chunks:
                ms = max(MIN_MS_CHUNK, int(total_ms * len(c) / total_chars))
                timing[ch][step0].append({'text': c, 'ms': ms})

    os.makedirs(os.path.dirname(TIMING_FILE), exist_ok=True)
    with open(TIMING_FILE, 'w') as f:
        json.dump(timing, f, ensure_ascii=False, indent=2)

    steps = sum(len(v) for v in timing.values())
    chunks_count = sum(len(c) for v in timing.values() for c in v.values())
    print(f"✓ Default mode: {len(timing)} chapters, {steps} steps, {chunks_count} chunks")
    print(f"  ffprobe: {used_ffprobe}, estimate: {used_estimate}")


def generate_minimax(chapters_filter: list[str] | None = None):
    """Use MiniMax word-level timing data for exact alignment"""
    if not os.path.isdir(WORD_TIMING_DIR):
        print(f"✗ Word timing directory not found: {WORD_TIMING_DIR}")
        print("  Run synthesize-audio first to generate word-level timing data.")
        sys.exit(1)

    with open(SEGMENTS_FILE) as f: segs = json.load(f)
    try:
        with open(TIMING_FILE) as f: timing = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        timing = {}

    available_chapters = set(os.listdir(WORD_TIMING_DIR))
    targets = set(chapters_filter) if chapters_filter else available_chapters

    used_minimax = used_default = 0

    for ch in targets:
        timing[ch] = {}
        word_ch_dir = os.path.join(WORD_TIMING_DIR, ch)
        if not os.path.isdir(word_ch_dir):
            # Fallback to default for this chapter
            for s in segs:
                if s['chapter'] != ch: continue
                step0 = str(s['step'] - 1)
                chunks = split_text(s['text'])
                real_dur = get_audio_duration(ch, s['step'])
                total_ms = int(real_dur * 1000) if real_dur > 0 else max(4000, int(len(s['text']) * 300))
                total_chars = sum(len(c) for c in chunks)
                timing[ch][step0] = [{'text': c, 'ms': max(MIN_MS_CHUNK, int(total_ms * len(c) / total_chars))} for c in chunks]
                used_default += 1
            continue

        for s in segs:
            if s['chapter'] != ch: continue
            step0 = str(s['step'] - 1)
            word_file = os.path.join(word_ch_dir, f"{s['step']}.json")
            if not os.path.isfile(word_file):
                # Fallback
                chunks = split_text(s['text'])
                real_dur = get_audio_duration(ch, s['step'])
                total_ms = int(real_dur * 1000) if real_dur > 0 else max(4000, int(len(s['text']) * 300))
                total_chars = sum(len(c) for c in chunks)
                timing[ch][step0] = [{'text': c, 'ms': max(MIN_MS_CHUNK, int(total_ms * len(c) / total_chars))} for c in chunks]
                used_default += 1
                continue

            with open(word_file) as f:
                word_data = json.load(f)

            # Group words into subtitle chunks (~MAX_CHARS each)
            chunks = []
            cur_text = ""
            cur_ms = 0
            for w in word_data:
                candidate = cur_text + w['text']
                if len(candidate) > MAX_CHARS and cur_text:
                    chunks.append({'text': cur_text, 'ms': max(MIN_MS_CHUNK, cur_ms)})
                    cur_text = w['text']
                    cur_ms = w['end_ms'] - w['start_ms']
                else:
                    cur_text = candidate
                    cur_ms = w['end_ms'] - (word_data[0]['start_ms'] if cur_text == w['text'] else 0)

            # Recalculate each chunk's ms from word boundaries
            chunks = []
            word_idx = 0
            while word_idx < len(word_data):
                chunk_text = word_data[word_idx]['text']
                chunk_start = word_data[word_idx]['start_ms']
                chunk_end = word_data[word_idx]['end_ms']
                word_idx += 1
                while word_idx < len(word_data) and len(chunk_text + word_data[word_idx]['text']) <= MAX_CHARS:
                    chunk_text += word_data[word_idx]['text']
                    chunk_end = word_data[word_idx]['end_ms']
                    word_idx += 1
                chunks.append({
                    'text': chunk_text,
                    'ms': max(MIN_MS_CHUNK, chunk_end - chunk_start)
                })

            timing[ch][step0] = chunks
            used_minimax += 1

    os.makedirs(os.path.dirname(TIMING_FILE), exist_ok=True)
    with open(TIMING_FILE, 'w') as f:
        json.dump(timing, f, ensure_ascii=False, indent=2)

    steps = sum(len(v) for v in timing.values())
    chunks_count = sum(len(c) for v in timing.values() for c in v.values())
    print(f"✓ Minimax mode: {len(timing)} chapters, {steps} steps, {chunks_count} chunks")
    print(f"  minimax word-timing: {used_minimax}, default fallback: {used_default}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate subtitle-timing.json")
    parser.add_argument("--mode", choices=["default", "minimax"], default="default")
    parser.add_argument("--chapters", nargs="*", help="Only process specific chapters")
    args = parser.parse_args()

    if args.mode == "minimax":
        generate_minimax(args.chapters)
    else:
        generate_default(args.chapters)
