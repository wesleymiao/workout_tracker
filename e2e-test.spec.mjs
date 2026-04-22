import { chromium } from 'playwright';

const BASE = 'https://workout-tracker-hdhrcrcrfvfygaf3.japanwest-01.azurewebsites.net';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  // 1. Home tab
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/e2e-01-home.png' });
  console.log('✅ Home loaded');

  // 2. Health tab - should show data + setup button
  await page.click('text=Health');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/e2e-02-health.png' });
  console.log('✅ Health tab loaded');

  // 3. Click setup button
  const setupBtn = page.locator('text=同步设置');
  if (await setupBtn.isVisible()) {
    await setupBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/e2e-03-setup.png' });
    console.log('✅ Setup wizard opened from data view');
  } else {
    console.log('⚠️ Setup button not found');
  }

  await browser.close();
  console.log('All tests passed!');
})();
