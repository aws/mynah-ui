import { ChatItem } from '../static';

export const chatItemHasContent = (chatItem: Partial<ChatItem>): boolean => (
  (chatItem.body != null && chatItem.body !== '') ||
chatItem.fileList != null ||
chatItem.footer != null ||
chatItem.formItems != null ||
chatItem.customRenderer != null ||
chatItem.buttons != null);

export const copyToClipboard = async (
  textToSendClipboard: string,
  onCopied?: () => void
): Promise<void> => {
  if (!document.hasFocus?.()) {
    window.focus();
  }
  try {
    await navigator.clipboard.writeText(textToSendClipboard);
  } finally {
    onCopied?.();
  }
};
