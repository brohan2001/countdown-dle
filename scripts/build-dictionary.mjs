#!/usr/bin/env node

/**
 * Build the Countdown word list from the CSW21 dictionary.
 *
 * CRITICAL: This processes Collins Scrabble Words (CSW21) which is copyrighted material
 * redistributed here without explicit license permission. This script and its output are
 * FOR DEVELOPMENT AND TESTING ONLY and must NOT be shipped in any public or production
 * deployment until proper licensing with Collins/HarperCollins is secured.
 *
 * Usage: node scripts/build-dictionary.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(REPO_ROOT, "apps", "web", "public");
const OUTPUT_FILE = path.join(PUBLIC_DIR, "words.txt");
const SOURCE_DOC = path.join(PUBLIC_DIR, "DICTIONARY_SOURCE.md");

const CSW21_URL =
  "https://raw.githubusercontent.com/scrabblewords/scrabblewords/main/words/British/CSW21.txt";

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  console.log(`Created directory: ${PUBLIC_DIR}`);
}

console.log("Downloading CSW21 word list...");
console.log(`Source: ${CSW21_URL}`);

const downloadFile = (url) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    https
      .get(url, (response) => {
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
      })
      .on("error", reject);
  });
};

(async () => {
  try {
    const data = await downloadFile(CSW21_URL);
    const lines = data.split("\n");

    const words = new Set();

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith("#")) continue;

      // Extract the first whitespace-delimited token (the word itself)
      const word = trimmed.split(/\s+/)[0];

      // Keep only A-Z entries of length 2-9 (Countdown max is 9 letters)
      if (word && /^[A-Z]{2,9}$/.test(word)) {
        words.add(word);
      }
    }

    // Sort alphabetically and write
    const sortedWords = Array.from(words).sort();

    fs.writeFileSync(OUTPUT_FILE, sortedWords.join("\n"), "utf-8");

    console.log(`✓ Wrote ${sortedWords.length} words to ${OUTPUT_FILE}`);

    // Write the source documentation
    const sourceDoc = `# Dictionary Source

**CRITICAL: Development/Prototype Only**

This dictionary file is **NOT licensed for production use**. It contains Collins Scrabble Words (CSW21),
which is copyrighted material from Collins, an imprint of HarperCollins Publishers Limited.

The file was downloaded from an unofficial GitHub repository and is redistributed here **for development
and testing purposes only**. It must NOT be included in any public or production deployment until proper
licensing with Collins/HarperCollins is formally secured.

## Source Information

- **Original Source:** https://raw.githubusercontent.com/scrabblewords/scrabblewords/main/words/British/CSW21.txt
- **Repository:** https://github.com/scrabblewords/scrabblewords
- **License:** The CSW21 file header explicitly reads: "Published under license with Collins, an imprint of HarperCollins Publishers Limited."
- **Redistribution Status:** No explicit LICENSE file is present in the hosting repository granting redistribution rights.

## Processing

This file was processed from the annotated CSW21 format (e.g., \`AAHED <aah=v> [v]\`) to extract:
- First whitespace-delimited token (the word)
- Only entries with A–Z characters, 2–9 letters in length
- Deduplicated and sorted alphabetically

## For Production

Before any public or production deployment:
1. Contact Collins/HarperCollins to obtain an official license to redistribute CSW21
2. Replace this file with an officially licensed version
3. Update this document to reflect the proper license

`;

    fs.writeFileSync(SOURCE_DOC, sourceDoc, "utf-8");
    console.log(`✓ Wrote dictionary source documentation to ${SOURCE_DOC}`);

    console.log("\n✓ Dictionary build complete.");
    console.log(
      "\n⚠️  REMINDER: This dictionary is for development only. Do not deploy to production without proper licensing."
    );
  } catch (error) {
    console.error("Error building dictionary:", error.message);
    process.exit(1);
  }
})();
