/**
 * extract-narrations.ts — collect every chapter's narration array and emit
 * a flat segment list that the TTS pipeline can consume.
 *
 * Run via:
 *   npm run extract-narrations           # writes audio-segments.json
 *   npm run extract-narrations -- --print # also prints to stdout
 *
 * Reads chapter order from src/registry/chapters.ts via a simple regex
 * (no React/CSS evaluation needed). For each chapter it dynamically
 * imports `src/chapters/<NN>-<id>/narrations.ts` (which is React-free)
 * and flattens to:
 *
 *   [
 *     { chapter, step, text, audio: "<chapter>/<step>.mp3" },
 *     ...
 *   ]
 *
 * Step indices in the JSON are 1-indexed, matching the audio file naming
 * convention (`public/audio/<chapter>/<N>.mp3`).
 *
 * Empty narration strings are skipped (silent steps don't need a TTS file).
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const REGISTRY_PATH = resolve(ROOT, "src/registry/chapters.ts");
const CHAPTERS_DIR = resolve(ROOT, "src/chapters");
const OUT_PATH = resolve(ROOT, "audio-segments.json");

interface Segment {
  chapter: string;
  step: number;
  text: string;
  audio: string;
}

/** Parse `src/registry/chapters.ts` to learn chapter id → folder order.
 *
 * Robust against nested objects (e.g. a chapter's `quizzes` array carries
 * its own `id` with no `title`): we key each chapter by its `narrations`
 * local binding and resolve the folder from the matching `import { narrations
 * as X } from "../chapters/<folder>/narrations"` line. This works regardless
 * of array-vs-import ordering and never mis-aligns chapters.
 */
async function readChapterOrder(): Promise<{ id: string; folder: string }[]> {
  const src = await readFile(REGISTRY_PATH, "utf8");

  // Top-level chapter objects begin with a `{` at 2-space indent and carry
  // an `id` plus a `narrations: <localName>` binding.
  const chapters: { id: string; narr: string }[] = [];
  for (const m of src.matchAll(
    /^  \{\s*\n\s*id:\s*["']([^"']+)["'][\s\S]*?\n\s*narrations:\s*(\w+)/gm,
  )) {
    chapters.push({ id: m[1]!, narr: m[2]! });
  }

  // Resolve each chapter's folder from its narrations import binding.
  const folderByNarr: Record<string, string> = {};
  for (const m of src.matchAll(
    /import\s+\{\s*narrations\s+as\s+(\w+)\s*\}\s+from\s+["']\.\.\/chapters\/([^"'\/]+)\/narrations["']/g,
  )) {
    folderByNarr[m[1]!] = m[2]!;
  }

  const missing = chapters.filter((c) => !folderByNarr[c.narr]);
  if (missing.length) {
    throw new Error(
      `could not resolve folder for chapters: ${missing
        .map((c) => c.id)
        .join(", ")}`,
    );
  }

  return chapters.map((c) => ({ id: c.id, folder: folderByNarr[c.narr]! }));
}

async function loadNarrations(folder: string): Promise<unknown[]> {
  const file = join(CHAPTERS_DIR, folder, "narrations.ts");
  if (!existsSync(file)) {
    throw new Error(`missing narrations.ts: ${file}`);
  }
  const url = pathToFileURL(file).href;
  const mod = await import(url);
  if (!Array.isArray(mod.narrations)) {
    throw new Error(
      `narrations.ts in ${folder} must export an array named "narrations"`,
    );
  }
  return mod.narrations as unknown[];
}

async function main() {
  const print = process.argv.includes("--print");
  const order = await readChapterOrder();

  const segments: Segment[] = [];
  let silentSteps = 0;
  for (const { id, folder } of order) {
    const arr = await loadNarrations(folder);
    arr.forEach((entry, i) => {
      const step = i + 1;
      if (typeof entry !== "string") {
        throw new Error(
          `chapter "${id}" step ${step}: narration must be a string ` +
            `(got ${typeof entry}). The {text, minHoldMs} form was removed; ` +
            `if your animation is longer than the narration, write longer ` +
            `narration, split the step, or speed the animation up.`,
        );
      }
      if (entry.trim() === "") {
        // Silent step — no TTS needed; runtime falls back to estimate.
        silentSteps++;
        return;
      }
      segments.push({
        chapter: id,
        step,
        text: entry,
        audio: `${id}/${step}.mp3`,
      });
    });
  }

  await writeFile(OUT_PATH, JSON.stringify(segments, null, 2) + "\n", "utf8");

  console.error(
    `✓ extracted ${segments.length} segments from ${order.length} chapters` +
      (silentSteps > 0 ? ` (skipped ${silentSteps} silent steps)` : ""),
  );
  console.error(`  → ${OUT_PATH}`);
  if (print) console.log(JSON.stringify(segments, null, 2));
}

main().catch((err) => {
  console.error(`✗ ${err.message ?? err}`);
  process.exit(1);
});
