import { QuickActionCommandGroup } from '../static';

export const filterQuickPickItems = (commands: QuickActionCommandGroup[], searchTerm: string): QuickActionCommandGroup[] => {
  if (searchTerm.trim() === '') {
    return commands;
  }

  const filteredQuickPickItemGroups: QuickActionCommandGroup[] = [];
  commands.forEach((quickPickGroup: QuickActionCommandGroup) => {
    const newQuickPickCommandGroup = { ...quickPickGroup };
    try {
      const promptRegex = new RegExp(searchTerm ?? '', 'gi');
      // Filter self
      newQuickPickCommandGroup.commands = newQuickPickCommandGroup.commands.filter(command => command.command.match(promptRegex) != null);

      if (newQuickPickCommandGroup.commands.length > 0) {
        filteredQuickPickItemGroups.push(newQuickPickCommandGroup);
      }

      // Filter children
      quickPickGroup.commands.forEach(command => {
        if (command.children != null && command.children.length > 0) {
          filteredQuickPickItemGroups.push(...filterQuickPickItems([ ...command.children ], searchTerm));
        }
      });
    } catch (e) {
      // In case the prompt is an incomplete regex
    }
  });
  return filteredQuickPickItemGroups;
};
