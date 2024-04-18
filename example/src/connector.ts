import { ChatItem, ChatItemType, ChatPrompt } from '@aws/mynah-ui';
import { Log } from './logger';
const STREAM_DELAY = 350;
const INITIAL_STREAM_DELAY = 1250;

export class Connector {
  requestGenerativeAIAnswer = async (
    streamingChatItems:Partial<ChatItem>[],
    onStreamUpdate: (chatItem: Partial<ChatItem>) => boolean,
    onStreamEnd: () => void
  ): Promise<boolean> => await new Promise((resolve, reject) => {
    Log('Simulating server response');
    setTimeout(() => {
      resolve(true);
      let streamFillInterval: ReturnType<typeof setInterval>;
      const mdStream = streamingChatItems.map(i => i).reverse();
      const intervalTimingMultiplier = Math.floor(Math.random() * (2) + 1);

      const endStream = ()=>{
        onStreamEnd();  
        clearInterval(streamFillInterval);
      }
      setTimeout(() => {
        streamFillInterval = setInterval(() => {
          if (mdStream.length > 0) {
            const stopStream = onStreamUpdate(mdStream.pop() ?? {});
            if(stopStream){
              endStream();
            }
          } else {
            endStream()
          }
        }, STREAM_DELAY * intervalTimingMultiplier);
      }, INITIAL_STREAM_DELAY);
    }, 150);
  });
}
