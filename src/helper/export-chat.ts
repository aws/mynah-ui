import { MynahUITabsStore } from './tabs-store';

/*
 * Export chat from a tab
 * @param tabId The tab id to export chat from
 * @returns The bodies of cards in markdown
 */
export const exportChat = (tabId: string): string => {
  return MynahUITabsStore.getInstance().getAllTabs()[tabId].store?.chatItems?.map(chatItem => chatItem.body ?? '').join('\n\n---\n\n') ?? '';
};
