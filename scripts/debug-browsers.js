#!/usr/bin/env node

/**
 * Script to debug browser installations and environment
 */

const { execSync } = require('child_process');
const path = require('path');

function debugBrowsers() {
    try {
        console.log('=== Browser Debug Information ===');
        
        const uiTestsPath = path.join(__dirname, '../ui-tests');
        
        // Check Playwright version
        console.log('\n1. Playwright Version:');
        execSync('npx playwright --version', {
            stdio: 'inherit',
            cwd: uiTestsPath,
        });
        
        // List installed browsers
        console.log('\n2. Installed Browsers:');
        execSync('npx playwright install --dry-run', {
            stdio: 'inherit',
            cwd: uiTestsPath,
        });
        
        // Check system info
        console.log('\n3. System Information:');
        console.log('Platform:', process.platform);
        console.log('Architecture:', process.arch);
        console.log('Node Version:', process.version);
        
        // Check environment variables
        console.log('\n4. Environment Variables:');
        console.log('WEBKIT_FORCE_COMPLEX_TEXT:', process.env.WEBKIT_FORCE_COMPLEX_TEXT);
        console.log('WEBKIT_DISABLE_COMPOSITING_MODE:', process.env.WEBKIT_DISABLE_COMPOSITING_MODE);
        console.log('PLAYWRIGHT_BROWSERS_PATH:', process.env.PLAYWRIGHT_BROWSERS_PATH);
        
        // Test browser launch
        console.log('\n5. Testing Browser Launch:');
        execSync('npx playwright test --list --project=webkit', {
            stdio: 'inherit',
            cwd: uiTestsPath,
        });
        
        console.log('\n=== Debug Complete ===');
        return true;
    } catch (error) {
        console.error('Debug failed:', error.message);
        return false;
    }
}

// If called directly, run the debug
if (require.main === module) {
    debugBrowsers();
}

module.exports = { debugBrowsers };
