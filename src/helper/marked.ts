import { marked, Tokens } from 'marked';
import escapeHTML from 'escape-html';

export const parseMarkdown = (markdownString: string, options?: {includeLineBreaks?: boolean; inline?: boolean}): string => {
  return options?.inline === true
    ? marked.parseInline(markdownString, {
      breaks: options?.includeLineBreaks,
    }) as string
    : marked.parse(markdownString, {
      breaks: options?.includeLineBreaks,
    }) as string;
};

export const configureMarked = (): void => {
  // Apply global fix for marked listitem content is not getting parsed.
  marked.use({
    renderer: {
      listitem: (item: Tokens.ListItem) => `<li>
  ${item.task ? `<input ${item.checked === true ? 'checked' : ''} disabled type="checkbox">` : ''}
  ${(item.task ? marked.parseInline : marked.parse)(item.text, { breaks: false }) as string}
  </li>`,
      link: (token) => {
        // Allow only http(s) URLs and relative URLs (most secure)
        const safeProtocols = /^https?:/i;
        const hasProtocol = token.href.includes(':');

        // Block if has protocol but not http(s)
        if (hasProtocol && !safeProtocols.test(token.href)) {
          return '';
        }
        const pattern = /^\[(?:\[([^\]]+)\]|([^\]]+))\]\(([^)]+)\)$/;
        // Expect raw formatted only in [TEXT](URL)
        if (!pattern.test(token.raw)) {
          return escapeHTML(token.href);
        }
        return `<a href="${escapeHTML(token.href)}" target="_blank" title="${escapeHTML(token.title ?? token.text)}">${escapeHTML(token.text)}</a>`;
      }
    },
    extensions: [ {
      name: 'text',
      renderer: (token) => {
        return token.text;
      }
    } ]
  });
};
