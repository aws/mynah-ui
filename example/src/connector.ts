import { ChatItem, ChatItemType, ChatPrompt } from '@aws/mynah-ui';
import { Log } from './logger';
const STREAM_DELAY = 350;
const INITIAL_STREAM_DELAY = 1250;

export class Connector {
  requestGenerativeAIAnswer = async (
    streamingChatItems:Partial<ChatItem>[],
    onStreamUpdate: (chatItem: Partial<ChatItem>) => void,
    onStreamEnd: () => void
  ): Promise<boolean> => await new Promise((resolve, reject) => {
    Log('Simulating server response');
    setTimeout(() => {
      resolve(true);

      const mdStream = streamingChatItems.map(i => i).reverse();
      const intervalTimingMultiplier = Math.floor(Math.random() * (2) + 1);
      setTimeout(() => {
        const streamFillInterval = setInterval(() => {
          if (mdStream.length > 0) {
            onStreamUpdate(mdStream.pop() ?? {});
          } else {
            clearInterval(streamFillInterval);
            onStreamEnd();
          }
        }, STREAM_DELAY * intervalTimingMultiplier);
      }, INITIAL_STREAM_DELAY);
    }, 150);
  });
}
