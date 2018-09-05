const { URL } = require('url');

const QUERY_INPUT_SELECTOR = 'input[name="q"]';
const QUERY_FORM_SELECTOR = 'form[name="f"]';
const SEARCH_RESULTS_SELECTOR = '.g';
const SEARCH_RESULT_LINKS_SELECTOR = '.g h3 a';
const CALC_RESULT_SELECTOR = '#cwos';
const CALC_RESULT_CHECK_PRECISION = 8;

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
        'should execute a Google "site:" search and check result domains',
        async () => {
            const host = 'medium.com';
            await executeGoogleSearch(`site:${host} jest`);

            const resultUrls = await getResultLinkUrls();
            expect(resultUrls).toSatisfyAll((url) => new URL(url).host === host);
        },
    );

    it(
        'should execute a Google "filetype:" search and check result file extensions',
        async () => {
            const fileType = 'pdf';
            await executeGoogleSearch(`filetype:${fileType} javascript`);

            const resultUrls = await getResultLinkUrls();
            expect(resultUrls).toSatisfyAll((url) => {
                const extensionDotIdx = url.lastIndexOf('.');
                if (extensionDotIdx === -1) {
                    return false;
                }

                return url.substr(extensionDotIdx + 1) === fileType;
            });
        },
    );

    it(
        'should execute a Google "inurl:" search and check result urls for given query',
        async () => {
            const inUrlQuery = 'article';
            await executeGoogleSearch(`inurl:${inUrlQuery} javascript`);

            const resultUrls = await getResultLinkUrls();
            expect(resultUrls).toSatisfyAll((url) => url.toLowerCase().indexOf(inUrlQuery.toLowerCase()) !== -1);
        },
    );

    it(
        'should execute math calculation with "+" correctly',
        async () => {
            const a = randInt(1000);
            const b = randInt(1000);
            await executeGoogleSearch(`${a} + ${b}`);

            const result = Number(await page.$eval(CALC_RESULT_SELECTOR, (el) => el.innerText));
            expect(result).toBeCloseTo(a + b, CALC_RESULT_CHECK_PRECISION);
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

async function getResultLinkUrls() {
    return await page.$$eval(
        SEARCH_RESULT_LINKS_SELECTOR,
        (resultLinks) => Array.prototype.map.call(resultLinks, (link) => link.href),
    );
}

function randInt(max) {
    return Math.floor(Math.random() * max);
}
