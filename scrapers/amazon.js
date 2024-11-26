const pw = require('playwright');
const AUTH = 'brd-customer-hl_6216694c-zone-scraping_browser1:zhy2f136m7gl';
const SBR_CDP = `wss://${AUTH}@brd.superproxy.io:9222`;
async function main() {
        console.log('Connecting to Scraping Browser...');
        const browser = await pw.chromium.connectOverCDP(SBR_CDP);
        // const browser = await pw.chromium.launch({ headless: false })
        try {
                console.log('Connected! Navigating...');
                const page = await browser.newPage();
                const booksSearch = '"live on mars" books'
                await page.goto(`https://amazon.com/s?k=${encodeURIComponent(booksSearch)}`,{ timeout: 2 * 60 * 1000 });
                await page.waitForSelector('[data-component-type="s-search-result"]')

                await paginateResults(page, ()=> getBooks(page))

                await page.screenshot({ path: './page.png', fullPage: true });
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

async function getBooks(page){
        const books = await page.$$('[data-component-type="s-search-result"]')
        for (let i = 0; i < (books.length); i++) {
                const titleElement = await books[i].$('h2 a span');
                if (titleElement) {
                        const title = await titleElement.innerText();
                        console.log(`${i + 1}. ${title}`);
                }
        }
}

async function paginateResults(page, processPage) {
        let currentPage = 1;
        let hasNextPage = true;
    
        while (hasNextPage) {
            console.log(`\nScraping page ${currentPage}...`);
            
            // Wait for results to load
            await page.waitForSelector(`[aria-label="Current page, page ${currentPage}"]`);
    
            // Execute the callback function for this page
            await processPage();
    
            // Check for next page button
            const nextButton = await page.$('a.s-pagination-next');
            if (!nextButton) {
                console.log('\nReached the last page.');
                hasNextPage = false;
            } else {
                await nextButton.click();
                currentPage++;
            }
        }
        
        return currentPage;
}