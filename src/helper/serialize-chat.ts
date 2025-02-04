import { MynahUITabsStore } from './tabs-store';

/**
 * Serialize all (non-empty_ chat messages in a tab to a markdown string
 * @param tabId Corresponding tab ID.
 * @returns The bodies of chat cards in markdown format, separated by \n\n---\n\n
 */
export const serializeMarkdown = (tabId: string): string => {
  return MynahUITabsStore.getInstance().getAllTabs()[tabId].store?.chatItems?.map(chatItem => chatItem.body ?? '').filter(chatItem => chatItem.trim() !== '').join('\n\n---\n\n') ?? '';
};
