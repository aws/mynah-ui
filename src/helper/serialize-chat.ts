import { ChatItemCard } from '../components/chat-item/chat-item-card';
import { MynahUITabsStore } from './tabs-store';

/**
 * Serialize all (non-empty) chat messages in a tab to a markdown string
 * @param tabId Corresponding tab ID.
 * @returns The bodies of chat cards in markdown format, separated by \n\n---\n\n
 */
export const serializeMarkdown = (tabId: string): string => {
  return MynahUITabsStore.getInstance().getAllTabs()[tabId].store?.chatItems?.map(chatItem => chatItem.body ?? '').filter(chatItem => chatItem.trim() !== '').join('\n\n---\n\n') ?? '';
};

/**
 * Serialize all (non-empty) chat messages in a tab to an HTML string
 * @param tabId Corresponding tab ID.
 * @returns The bodies of chat cards in HTML format
 */
export const serializeHtml = (tabId: string): string => {
  const chatItemCardDivs = MynahUITabsStore.getInstance().getAllTabs()[tabId].store?.chatItems?.filter(chatItem => (chatItem.body != null) && chatItem.body.trim() !== '').map(chatItem => new ChatItemCard({
    chatItem,
    tabId,
  }).render.outerHTML).join('\n');

  // Get all relevant styles from the document
  const styleSheets = Array.from(document.styleSheets);
  const relevantStyles = styleSheets
    .map(sheet => {
      try {
        const rules = Array.from(sheet.cssRules);
        rules.forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            if (rule.selectorText === '.mynah-chat-wrapper') {
              rule.style.display = 'block';
            }
            if (rule.selectorText.includes('.mynah-chat-item-card')) {
              rule.style.opacity = '1';
              rule.style.transform = 'none';
            }
          }
        });
        rules.push();
        return Array.from(rules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        console.warn('Could not read stylesheet rules', e);
        return '';
      }
    })
    .join('\n');

  return `
    <html>
      <head>
        <style>
        ${relevantStyles}
        </style>
      </head>
      <body>
      <div class="mynah-chat-wrapper" style="max-width: 500px; overflow: scroll; margin: auto; border: 1px solid gray;">
        <div class="mynah-chat-items-container">${chatItemCardDivs ?? ''}</div>
        </div>
      </body>
    </html>
  `;
};
