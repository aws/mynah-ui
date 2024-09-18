import { configureToMatchImageSnapshot } from 'jest-image-snapshot';

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  failureThreshold: 0.15,
});

expect.extend({ toMatchImageSnapshot });
