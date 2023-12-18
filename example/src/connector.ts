import { ChatItem, ChatItemType, ChatPrompt } from '@aws/mynah-ui';
import { exampleFollowUps, exampleSources, exampleStreamParts } from './samples/sample-data';
import { Log } from './logger';
const STREAM_DELAY = 350;
const INITIAL_STREAM_DELAY = 1250;

export class Connector {
  requestGenerativeAIAnswer = async (
    prompt: ChatPrompt,
    onStreamUpdate: (chatItem: Partial<ChatItem>) => void,
    onStreamEnd: (chatItem: ChatItem) => void
  ): Promise<ChatItem> => await new Promise((resolve, reject) => {
    Log(`Simulating server response for prompt "${(prompt.prompt ?? '').substring(0, 100)}"`);
    setTimeout(() => {
      resolve({
        type: ChatItemType.ANSWER_STREAM,
        body: '',
        canBeVoted: true,
        messageId: (new Date()).getTime().toString()
      });

      const mdStream = exampleStreamParts.map(i => i).reverse();
      const intervalTimingMultiplier = Math.floor(Math.random() * (2) + 1);
      setTimeout(() => {
        const streamFillInterval = setInterval(() => {
          if (mdStream.length > 0) {
            onStreamUpdate({
              body: mdStream.pop() as string
            });
          } else {
            clearInterval(streamFillInterval);
            onStreamUpdate({
              relatedContent: {
                content: exampleSources,
                title: 'Sources'
              },
              codeReference: [
                {
                  recommendationContentSpan: {
                    start: 952,
                    end: 967
                  },
                  information: 'Say Hello to **`MynahUI`**.'
                },
                {
                  recommendationContentSpan: {
                    start: 1034,
                    end: 1409
                  },
                  information: 'Reference code *under the Apache License 2.0 license* from repository **`@aws/mynah-ui`**.'
                }
              ]
            });
            onStreamEnd(exampleFollowUps);
          }
        }, STREAM_DELAY * intervalTimingMultiplier);
      }, INITIAL_STREAM_DELAY);
    }, 150);
  });
}
