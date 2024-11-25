const pw = require('playwright');
const AUTH = 'brd-customer-hl_6216694c-zone-scraping_browser1:zhy2f136m7gl';
const SBR_CDP = `wss://${AUTH}@brd.superproxy.io:9222`;
async function main() {
        console.log('Connecting to Scraping Browser...');
        const browser = await pw.chromium.connectOverCDP(SBR_CDP);
        try {
                console.log('Connected! Navigating...');
                const page = await browser.newPage();
                await page.goto('https://amazon.com',{ timeout: 2 * 60 * 1000 });
                console.log('Taking screenshot to page.png');
                await page.screenshot({ path: './page.png', fullPage: true });
                console.log('Navigated! Scraping page content...');
                const html = await page.content();
                console.log(html);
        } finally {
                await browser.close();
        }
}
if (require.main === module) {
        main().catch(err => {
                console.error(err.stack || err);
                process.exit(1);
        });
}