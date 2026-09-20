/**
 * Scans /app, /components and /content for the banned phrases in
 * lib/banned-phrases.ts and fails (non-zero exit) if any are found outside
 * the Integrity Policy page, the one place they're explained rather than
 * used as marketing copy.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { BANNED_PHRASES } from "../lib/banned-phrases";

const SCAN_DIRS = ["app", "components", "content"];
const EXTENSIONS = new Set(["ts", "tsx", "js", "jsx", "md", "mdx", "json"]);
const IS_ALLOWLISTED = (filePath: string) => filePath.toLowerCase().includes("/integrity");

interface Violation {
  file: string;
  line: number;
  phrase: string;
  excerpt: string;
}

async function listFiles(dir: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true, recursive: true });
  } catch {
    return []; // directory doesn't exist yet - nothing to lint.
  }

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
    .filter((filePath) => EXTENSIONS.has(path.extname(filePath).slice(1)));
}

async function main() {
  const files = (await Promise.all(SCAN_DIRS.map(listFiles))).flat();
  const violations: Violation[] = [];

  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file).replace(/\\/g, "/");
    if (IS_ALLOWLISTED(relativePath)) continue;

    const content = await readFile(file, "utf8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      const normalised = line.toLowerCase();
      for (const phrase of BANNED_PHRASES) {
        if (normalised.includes(phrase)) {
          violations.push({ file: relativePath, line: index + 1, phrase, excerpt: line.trim() });
        }
      }
    });
  }

  if (violations.length > 0) {
    console.error(`copy-lint: found ${violations.length} banned phrase(s):\n`);
    for (const v of violations) {
      console.error(`  ${v.file}:${v.line} — "${v.phrase}"\n    ${v.excerpt}`);
    }
    console.error(
      "\nSee CLAUDE.md's banned-phrase list. Only the Integrity Policy page is allow-listed.",
    );
    process.exit(1);
  }

  console.log(`copy-lint: clean (${files.length} files scanned).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
