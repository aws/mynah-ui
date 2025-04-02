import { ChatItemCard } from '../components/chat-item/chat-item-card';
import { MynahUITabsStore } from './tabs-store';
import { ChatItem } from '../static';

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
  const chatItemCardDivs = MynahUITabsStore.getInstance().getAllTabs()[tabId].store?.chatItems?.filter((chatItem): chatItem is ChatItem =>
    chatItem?.body != null && chatItem.body.trim() !== ''
  ).map(chatItem => new ChatItemCard({
    chatItem: {
      type: chatItem.type,
      body: chatItem.body,
      messageId: chatItem.messageId,
      status: chatItem.status,
      icon: chatItem.icon
    },
    tabId,
  }).render.outerHTML).reverse().join('\n');

  // Get all relevant styles from the document
  const styleSheets = Array.from(document.styleSheets);
  const relevantStyles = styleSheets
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules)
          .map(rule => {
            let ruleText = rule.cssText;

            if (rule instanceof CSSStyleRule) {
              if (rule.selectorText === '.mynah-chat-wrapper') {
                ruleText = `.mynah-chat-wrapper { display: block !important; ${rule.style.cssText} }`;
              }
              if (rule.selectorText.includes('.mynah-chat-item-card')) {
                ruleText = rule.cssText.replace('opacity: 0', 'opacity: 1').replace('transform: translate3d(0px, min(50%, 25vh), 0px) scale(0.95, 1.25)', 'transform: none');
              }
              if (rule.selectorText.includes('.mynah-syntax-highlighter-copy-buttons')) {
                ruleText = rule.cssText.replace('display: flex', 'display: none');
              }
            }

            return ruleText;
          })
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
      <div class="mynah-chat-wrapper" style="max-width: 600px; overflow-y: scroll; margin: auto; border: 1px solid gray;">
        <div class="mynah-chat-items-container">${chatItemCardDivs ?? ''}</div>
        </div>
      </body>
    </html>
  `;
};
