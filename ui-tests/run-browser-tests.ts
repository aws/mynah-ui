/**
 * Helper script to run tests for a specific browser
 */
import { execSync } from 'child_process';

// Define valid browser types
type BrowserType = 'all' | 'chromium' | 'webkit';

// Get the browser from environment variable or use default
const browser = (process.env.BROWSER ?? 'all') as BrowserType;

console.log(`Running tests for browser: ${browser}`);

try {
  if (browser === 'all') {
    // Run tests for all browsers using the default config
    execSync('jest --detectOpenHandles --config=./jest.config.js', { stdio: 'inherit' });
  } else if (browser === 'chromium') {
    // Run tests for Chromium only
    execSync('jest --updateSnapshot --detectOpenHandles --config=./jest.chromium.config.js', { stdio: 'inherit' });
  } else if (browser === 'webkit') {
    // Run tests for Webkit only
    execSync('jest --updateSnapshot --detectOpenHandles --config=./jest.webkit.config.js', { stdio: 'inherit' });
  } else {
    process.exit(1);
  }
} catch (error) {
  console.error(`Test execution failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
