import { configureToMatchImageSnapshot } from 'jest-image-snapshot';

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  comparisonMethod: 'ssim',
  diffDirection: 'vertical',
  failureThreshold: 0.01,
});

expect.extend({ toMatchImageSnapshot });
