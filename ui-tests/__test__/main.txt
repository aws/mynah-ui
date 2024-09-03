const puppeteer = require('puppeteer');
const path = require('path');

async function waitForTransitionEnd(page, element) {
    await page.evaluate(element => {
        return new Promise(resolve => {
            const transition = document.querySelector(element);
            const onEnd = function () {
                transition.removeEventListener('transitionend', onEnd);
                resolve();
            };
            transition.addEventListener('transitionend', onEnd);
        });
    }, element);
}

(async () => {
    const browser = await puppeteer.launch({ headless: false, ignoreDefaultArgs: [], timeout: 3000 });
    const page = await browser.newPage();
    const htmlFilePath = path.join(__dirname, '../dist/index.html');
    const fileUrl = 'file://' + htmlFilePath;
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
    await page.setViewport({ width: 600, height: 950 });

    const helloCard = await page.waitForSelector('.mynah-chat-item-card');

    if (helloCard != null) {
        console.log('Basic content generated for MynahUI');
    } else {
        console.warn("Couldn't render MynahUI");
    }

    await waitForTransitionEnd(page, '.mynah-chat-item-card');
    await page.screenshot({
        type: 'jpeg',
        path: 'snapshot-1.jpg',
    });

    await page.locator('textarea.mynah-chat-prompt-input').fill('Hello User Prompt');
    await page.locator('button.mynah-chat-prompt-button').click();

    const userCard = await page.waitForSelector('.mynah-chat-item-card.mynah-chat-item-prompt');
    await waitForTransitionEnd(page, '.mynah-chat-item-card.mynah-chat-item-prompt');

    const userPromptText = await userCard.evaluate(el => el.innerText);
    if (userPromptText === 'Hello User Prompt') {
        console.log('User prompt works');
    } else {
        throw new Error("User prompt didn't appear");
    }

    await page.screenshot({
        type: 'jpeg',
        path: 'snapshot-2.jpg',
        optimizeForSpeed: true,
    });

    await page.locator('textarea.mynah-chat-prompt-input').fill('Hello User Prompt 2');
    await page.locator('button.mynah-chat-prompt-button').click();

    const userCard2 = await page.waitForSelector('.mynah-chat-item-card.mynah-chat-item-prompt::-p-text(Hello User Prompt 2)');
    const userPromptText2 = await userCard2.evaluate(el => el.innerText);
    if (userPromptText2 === 'Hello User Prompt 2') {
        console.log('User prompt works');
    } else {
        throw new Error("User prompt didn't appear");
    }

    await waitForTransitionEnd(page, '.mynah-chat-item-card');
    await page.screenshot({
        type: 'jpeg',
        path: 'snapshot-3.jpg',
    });

    await browser.close();
})();
