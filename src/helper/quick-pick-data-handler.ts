import escapeHTML from 'escape-html';
import { QuickActionCommand, QuickActionCommandGroup } from '../static';
import { MynahIcons } from '../main';

export const filterQuickPickItems = (commands: QuickActionCommandGroup[], searchTerm: string): QuickActionCommandGroup[] => {
  if (searchTerm.trim() === '') {
    return commands;
  }

  const matchedCommands: Array<{score: number; command: QuickActionCommand}> = [];

  const findMatches = (cmd: QuickActionCommand): void => {
    const score = calculateItemScore(cmd.command, searchTerm);
    if (score > 0) {
      matchedCommands.push({
        score,
        command: {
          ...cmd,
          // Update command with highlighted text
          // It is being reverted when user makes the selection
          command: highlightMatch(escapeHTML(cmd.command), searchTerm)
        }
      });
    }

    // Search for children
    cmd.children?.forEach(childGroup => {
      childGroup.commands.forEach(childCmd => {
        findMatches(childCmd);
      });
    });
  };

  // Filter all commands
  commands.forEach(group => {
    group.commands.forEach(cmd => {
      findMatches(cmd);
    });
  });

  const returnGroup: QuickActionCommandGroup = {
    icon: MynahIcons.SEARCH,
    groupName: `### "${searchTerm}"`,
    commands: []
  };
  if (matchedCommands.length > 0) {
    returnGroup.commands = matchedCommands.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .map((item) => item.command);
  }

  return [ returnGroup ];
};

export const MARK_OPEN = '<mark>';
export const MARK_CLOSE = '</mark>';

const highlightMatch = (text: string, searchTerm: string): string => {
  const textToCompare = text.toLowerCase();
  const searchTermToCompare = searchTerm.toLowerCase();

  // Exact
  if (textToCompare === searchTermToCompare) {
    return `${MARK_OPEN}${text}${MARK_CLOSE}`;
  }

  // Prefix
  if (textToCompare.startsWith(searchTermToCompare)) {
    const matchLength = searchTerm.length;
    const matchedPart = text.slice(0, matchLength);
    const restPart = text.slice(matchLength);
    return `${MARK_OPEN}${matchedPart}${MARK_CLOSE}${restPart}`;
  }

  // Contains
  const startIndex = textToCompare.indexOf(searchTermToCompare);
  if (startIndex !== -1) {
    const before = text.slice(0, startIndex);
    const match = text.slice(startIndex, startIndex + searchTerm.length);
    const after = text.slice(startIndex + searchTerm.length);
    return `${before}${MARK_OPEN}${match}${MARK_CLOSE}${after}`;
  }

  // Words
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase();
    if (word.includes(searchTermToCompare)) {
      const startIdx = word.indexOf(searchTermToCompare);
      const originalWord = words[i];
      words[i] =
              originalWord.slice(0, startIdx) +
              `${MARK_OPEN}${originalWord.slice(startIdx, startIdx + searchTerm.length)}${MARK_CLOSE}` +
              originalWord.slice(startIdx + searchTerm.length);
      return words.join(' ');
    }
  }

  // Partial
  let result = '';
  let lastIndex = 0;
  let termIndex = 0;

  for (let i = 0; i < text.length && termIndex < searchTerm.length; i++) {
    if (text[i].toLowerCase() === searchTerm[termIndex].toLowerCase()) {
      result += text.slice(lastIndex, i);
      result += `${MARK_OPEN}${text[i]}${MARK_CLOSE}`;
      lastIndex = i + 1;
      termIndex++;
    }
  }
  result += text.slice(lastIndex);

  return termIndex === searchTerm.length ? result : text;
};

const calculateItemScore = (text: string, searchTerm: string): number => {
  const normalizedText = text.toLowerCase();
  const normalizedTerm = searchTerm.toLowerCase();

  const isExactMatch = normalizedText === normalizedTerm;
  const isPrefixMatch = normalizedText.startsWith(normalizedTerm);
  const isWordStartMatch = normalizedText.split(' ').some(word => word.startsWith(normalizedTerm));
  const isContainsMatch = normalizedText.includes(normalizedTerm);

  if (isExactMatch) return 100;
  if (isPrefixMatch) return 80;
  if (isWordStartMatch) return 60;
  if (isContainsMatch) return 40;

  return calculateScore(normalizedText, normalizedTerm);
};

const calculateScore = (text: string, term: string): number => {
  let score = 0;
  let termIndex = 0;
  let consecutiveMatches = 0;

  for (let i = 0; i < text.length && termIndex < term.length; i++) {
    if (text[i] === term[termIndex]) {
      score += 10 + consecutiveMatches;
      consecutiveMatches++;
      termIndex++;
    } else {
      consecutiveMatches = 0;
    }
  }

  return termIndex === term.length ? score : 0;
};
