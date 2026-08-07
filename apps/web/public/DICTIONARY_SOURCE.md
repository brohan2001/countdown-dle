# Dictionary Source

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

This file was processed from the annotated CSW21 format (e.g., `AAHED <aah=v> [v]`) to extract:
- First whitespace-delimited token (the word)
- Only entries with A–Z characters, 2–9 letters in length
- Deduplicated and sorted alphabetically

## For Production

Before any public or production deployment:
1. Contact Collins/HarperCollins to obtain an official license to redistribute CSW21
2. Replace this file with an officially licensed version
3. Update this document to reflect the proper license

