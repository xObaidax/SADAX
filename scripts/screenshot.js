const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const workspace = path.resolve(__dirname, '..');
const target = pathToFileURL(path.join(workspace, 'html', 'index.test.html')).href;
const outputDir = path.join(workspace, 'screenshots');
const scenarios = [
  { name: 'mobile-light-en', width: 375, height: 812, theme: 'light', language: 'en' },
  { name: 'tablet-light-en', width: 768, height: 1024, theme: 'light', language: 'en' },
  { name: 'desktop-light-en', width: 1440, height: 900, theme: 'light', language: 'en' },
  { name: 'desktop-dark-en', width: 1440, height: 900, theme: 'dark', language: 'en' },
  { name: 'desktop-light-ar', width: 1440, height: 900, theme: 'light', language: 'ar' },
  { name: 'desktop-dark-ar', width: 1440, height: 900, theme: 'dark', language: 'ar' },
];

function isBackendRequest(url) {
  try {
    return /\/(?:api|auth)\//.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: { width: scenario.width, height: scenario.height },
  });
  await context.addInitScript(({ theme, language }) => {
    localStorage.setItem('vocaflow_theme', theme);
    localStorage.setItem('vocaflow_locale', language);
  }, { theme: scenario.theme, language: scenario.language });

  const page = await context.newPage();
  const result = {
    ...scenario,
    screenshots: [],
    consoleMessages: [],
    pageErrors: [],
    failedNetworkRequests: [],
    expectedBackendFailures: [],
    navigationErrors: [],
  };
  let stage = 'initial load';

  page.on('console', message => {
    if (['log', 'warning', 'error'].includes(message.type())) {
      const entry = { stage, type: message.type(), text: message.text() };
      if (/\/(?:api|auth)\//.test(entry.text)) {
        entry.expectedBackendFailure = true;
        result.expectedBackendFailures.push({ stage, source: 'console', error: entry.text });
      }
      result.consoleMessages.push(entry);
    }
  });
  page.on('pageerror', error => {
    result.pageErrors.push({ stage, message: error.message });
  });
  page.on('requestfailed', request => {
    const failure = {
      stage,
      url: request.url(),
      error: request.failure()?.errorText || 'Request failed',
    };
    (isBackendRequest(failure.url) ? result.expectedBackendFailures : result.failedNetworkRequests).push(failure);
  });
  page.on('response', response => {
    if (response.status() < 400) return;
    const failure = { stage, url: response.url(), status: response.status() };
    (isBackendRequest(failure.url) ? result.expectedBackendFailures : result.failedNetworkRequests).push(failure);
  });

  try {
    try {
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 20000 });
    } catch (error) {
      result.navigationErrors.push({ stage, message: error.message });
    }
    stage = 'reload';
    try {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
    } catch (error) {
      result.navigationErrors.push({ stage, message: error.message });
    }

    await page.waitForTimeout(5000);
    result.dom = await page.evaluate(() => ({
      mounted: Boolean(document.querySelector('#root')?.children.length),
      rootChildren: document.querySelector('#root')?.children.length || 0,
      htmlLang: document.documentElement.lang,
      htmlDir: document.documentElement.dir,
      theme: document.documentElement.getAttribute('data-theme'),
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyHeight: document.body.scrollHeight,
      navigationButtons: [...document.querySelectorAll('.bottom-nav-premium .nav-tab')]
        .map(button => button.getAttribute('aria-label') || button.textContent.trim()),
    }));

    const mainScreenshot = path.join(outputDir, `${scenario.name}.png`);
    await page.screenshot({ path: mainScreenshot, fullPage: true });
    result.screenshots.push(path.relative(workspace, mainScreenshot));

    if (scenario.name === 'desktop-light-en' && result.dom.mounted) {
      const tabs = page.locator('.bottom-nav-premium .nav-tab');
      if (await tabs.count() >= 3) {
        for (const [index, section] of [[1, 'stats'], [2, 'settings']]) {
          stage = `navigation: ${section}`;
          await tabs.nth(index).click();
          await page.waitForTimeout(400);
          const screenshot = path.join(outputDir, `desktop-light-en-${section}.png`);
          await page.screenshot({ path: screenshot, fullPage: true });
          result.screenshots.push(path.relative(workspace, screenshot));
        }
      }
    }
  } catch (error) {
    result.harnessError = error.message;
  } finally {
    await context.close();
  }
  return result;
}

async function main() {
  if (!fs.existsSync(path.join(workspace, 'html', 'index.test.html'))) {
    throw new Error('Missing html/index.test.html');
  }
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    args: ['--allow-file-access-from-files'],
  });
  const results = [];
  try {
    for (const scenario of scenarios) {
      const result = await captureScenario(browser, scenario);
      results.push(result);
      console.log(`${scenario.name}: ${result.dom?.mounted ? 'mounted' : 'PAGE DID NOT MOUNT'}; ${result.screenshots.length} screenshot(s)`);
    }
  } finally {
    await browser.close();
  }
  const report = {
    generatedAt: new Date().toISOString(),
    target,
    localStorageKeys: { theme: 'vocaflow_theme', language: 'vocaflow_locale' },
    scenarios: results,
  };
  const reportPath = path.join(outputDir, 'console-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(`Report: ${path.relative(workspace, reportPath)}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
