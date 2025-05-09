/**
 * Helper script to run tests for a specific browser
 */
const { execSync } = require('child_process');

// Get the browser from environment variable or use default
const browser = process.env.BROWSER || 'all';

console.log(`Running tests for browser: ${browser}`);

try {
  if (browser === 'all') {
    // Run tests for all browsers using the default config
    execSync('jest --detectOpenHandles --config=./jest.config.js', { stdio: 'inherit' });
  } else if (browser === 'chromium') {
    // Run tests for Chromium only
    execSync('jest --detectOpenHandles --config=./jest.chromium.config.js', { stdio: 'inherit' });
  } else if (browser === 'webkit') {
    // Run tests for Webkit only
    execSync('jest --detectOpenHandles --config=./jest.webkit.config.js', { stdio: 'inherit' });
  } else {
    console.error(`Unsupported browser: ${browser}`);
    process.exit(1);
  }
} catch (error) {
  console.error(`Test execution failed: ${error}`);
  process.exit(1);
}