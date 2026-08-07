export interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
}

export class Dictionary {
  private root: TrieNode;
  private wordSet: Set<string>;

  constructor(words?: string[]) {
    this.root = { children: new Map(), isEnd: false };
    this.wordSet = new Set();
    if (words) {
      words.forEach((word) => this.addWord(word.toUpperCase()));
    }
  }

  private addWord(word: string): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, { children: new Map(), isEnd: false });
      }
      node = node.children.get(char)!;
    }
    node.isEnd = true;
    this.wordSet.add(word);
  }

  isValid(word: string): boolean {
    const upperWord = word.toUpperCase();
    return this.wordSet.has(upperWord);
  }

  getAllWordsFromLetters(letters: string[]): string[] {
    const letterCounts = new Map<string, number>();
    for (const letter of letters) {
      const upper = letter.toUpperCase();
      letterCounts.set(upper, (letterCounts.get(upper) || 0) + 1);
    }

    const results: string[] = [];

    const dfs = (node: TrieNode, word: string, remaining: Map<string, number>) => {
      if (node.isEnd && word.length > 0) {
        results.push(word);
      }

      for (const [char, childNode] of node.children) {
        if (remaining.get(char) || 0 > 0) {
          const newRemaining = new Map(remaining);
          newRemaining.set(char, newRemaining.get(char)! - 1);
          dfs(childNode, word + char, newRemaining);
        }
      }
    };

    dfs(this.root, "", letterCounts);
    return results;
  }

  getLongestWord(letters: string[]): string | null {
    const words = this.getAllWordsFromLetters(letters);
    if (words.length === 0) return null;
    return words.reduce((longest, word) =>
      word.length > longest.length ? word : longest
    );
  }

  static loadFromText(text: string): Dictionary {
    const words = text.split(/\s+/).filter(w => w.length > 0 && w.length <= 9);
    return new Dictionary(words);
  }
}
