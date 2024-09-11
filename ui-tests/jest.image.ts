import { configureToMatchImageSnapshot } from 'jest-image-snapshot';

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  comparisonMethod: 'ssim',
  diffDirection: 'vertical',
  failureThreshold: 0.1,
});

expect.extend({ toMatchImageSnapshot });
