import { ChatItem } from '@aws/mynah-ui';
import md0 from './stream-0.md';
import md1 from './stream-1.md';
import md2 from './stream-2.md';
import md3 from './stream-3.md';
import md4 from './stream-4.md';
import { mockSources } from './sources';


export const mockStreamParts: Partial<ChatItem>[] = [
    { body: `${md0 as string}` },
    { body: `${md1 as string}` },
    { body: `${md2 as string}` },
    { body: `${md3 as string}` },
    { body: `${md4 as string}` },
    {
        relatedContent: {
            content: mockSources,
            title: 'Sources',
        },
        codeReference: [
            {
                recommendationContentSpan: {
                    start: 762,
                    end: 777,
                },
                information: 'Mock code reference **`MynahUI`**.',
            }
        ],
    },
];