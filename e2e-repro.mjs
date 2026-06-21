import { chromium } from 'playwright';
const BASE = 'https://workout-tracker-hdhrcrcrfvfygaf3.japanwest-01.azurewebsites.net';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultTimeout(60000);
  
  // Listen for console errors
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  page.on('console', msg => { if (msg.type() === 'error') console.error('CONSOLE ERROR:', msg.text()) });

  await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2000);

  // Go to Workout, select Push, use past workout
  await page.click('text=Workout');
  await page.waitForTimeout(1000);
  await page.click('text=Push');
  await page.waitForTimeout(500);
  
  // Continue checklist
  const cont = page.locator('button:has-text("Continue")');
  if (await cont.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cont.click();
    await page.waitForTimeout(1000);
  }

  // Select the most recent past workout
  const mostRecent = page.locator('text=Most Recent').first();
  if (await mostRecent.isVisible({ timeout: 2000 }).catch(() => false)) {
    await mostRecent.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/e2e-repro-1-planner.png' });
    console.log('✅ Loaded past workout');
  }

  // Start workout
  const startBtn = page.locator('button:has-text("Start Workout")');
  if (await startBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await startBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/e2e-repro-2-active.png' });
    console.log('✅ Active workout');
  }

  // Try completing first exercise via toggle button
  const toggleBtns = page.locator('button.rounded-full.border-2');
  const count = await toggleBtns.count();
  console.log(`Found ${count} toggle buttons`);
  if (count > 0) {
    await toggleBtns.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/e2e-repro-3-completed.png' });
    console.log('✅ Toggled first exercise');
  }

  // Check for difficulty dialog
  const diff = page.locator('text=完成难度');
  if (await diff.isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.screenshot({ path: '/tmp/e2e-repro-4-difficulty.png' });
    console.log('✅ Difficulty dialog shown');
    await page.click('text=🥵 吃力');
    await page.waitForTimeout(500);
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/e2e-repro-5-final.png' });

  // Cancel workout to clean up
  const cancelBtn = page.locator('button:has-text("Cancel")');
  if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cancelBtn.click();
    await page.waitForTimeout(500);
  }

  await browser.close();
  console.log('Done');
})();
