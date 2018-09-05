const { URL } = require('url');

const QUERY_INPUT_SELECTOR = 'input[name="q"]';
const QUERY_FORM_SELECTOR = 'form[name="f"]';
const SEARCH_RESULTS_SELECTOR = '.g';

describe('Google', () => {
    beforeAll(async () => {
        await page.goto('https://google.com')
    });

    it(
        'should execute a Google search for a given query and check that the resulting page has 10 results',
        async () => {
            await executeGoogleSearch('jest puppeteer');

            const resultsCount = await page.$$eval(
                SEARCH_RESULTS_SELECTOR,
                (resultElements) => resultElements.length,
            );
            expect(resultsCount).toBe(10);
        },
    );

    it(
        'should execute a Google "site:" search and check results domains',
        async () => {
            const host = 'medium.com';
            await executeGoogleSearch(`site:${host} jest`);

            const resultUrls = await page.$$eval(
                '.g h3 a',
                (resultLinks) => Array.prototype.map.call(resultLinks, (link) => link.href),
            );
            expect(resultUrls).toSatisfyAll((url) => new URL(url).host === host);
        },
    );
});

async function executeGoogleSearch(query) {
    await page.$eval(QUERY_INPUT_SELECTOR, (input) => { input.value = ''; });
    await page.type(QUERY_INPUT_SELECTOR, query);

    await Promise.all([
        page.waitForNavigation(),
        page.$eval(QUERY_FORM_SELECTOR, (form) => form.submit()),
    ]);
}
