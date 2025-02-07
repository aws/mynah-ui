import { QuickActionCommandGroupInternal } from '../static';

export const filterQuickPickItems = (commands: QuickActionCommandGroupInternal[], searchTerm: string): QuickActionCommandGroupInternal[] => {
  if (searchTerm.trim() === '') {
    return commands;
  }

  const filteredQuickPickItemGroups: QuickActionCommandGroupInternal[] = [];
  commands.forEach((quickPickGroup: QuickActionCommandGroupInternal) => {
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

export const addRouteToCommandGroups = (
  commandGroups: QuickActionCommandGroupInternal[],
  parentRoute: string[] = []
): QuickActionCommandGroupInternal[] => {
  return commandGroups.map(group => {
    const updatedGroup = { ...group };
    updatedGroup.commands = group.commands.map(command => {
      const updatedCommand = { ...command };
      const currentRoute = [ ...parentRoute, command.command ];
      updatedCommand.route = currentRoute;

      // If the command has children, recurse
      if ((updatedCommand.children != null) && updatedCommand.children.length > 0) {
        updatedCommand.children = addRouteToCommandGroups(updatedCommand.children, currentRoute);
      }

      return updatedCommand;
    });

    return updatedGroup;
  });
};
