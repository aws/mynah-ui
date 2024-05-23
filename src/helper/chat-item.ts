import { ChatItem } from '../static';

export const chatItemHasContent = (chatItem: Partial<ChatItem>): boolean => (
  (chatItem.body != null && chatItem.body !== '') ||
chatItem.fileList != null ||
chatItem.formItems != null ||
chatItem.customRenderer != null ||
chatItem.buttons != null);
