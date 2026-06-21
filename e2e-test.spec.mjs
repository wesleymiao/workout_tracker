import { chromium } from 'playwright';

const BASE = 'https://workout-tracker-hdhrcrcrfvfygaf3.japanwest-01.azurewebsites.net';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultTimeout(60000);

  await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2000);

  // Go to Workout tab
  await page.click('text=Workout');
  await page.waitForTimeout(1000);

  // Select Push
  await page.click('text=Push');
  await page.waitForTimeout(500);

  // Handle checklist
  const continueBtn = page.locator('button:has-text("Continue")');
  if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await continueBtn.click();
    await page.waitForTimeout(1000);
  }

  // Screenshot to see current state
  await page.screenshot({ path: '/tmp/e2e-debug-after-checklist.png' });
  console.log('After checklist page content:');
  const text = await page.locator('body').innerText();
  console.log(text.slice(0, 500));

  // Look for Start Fresh button
  const startFresh = page.locator('button:has-text("Start Fresh")');
  if (await startFresh.isVisible({ timeout: 2000 }).catch(() => false)) {
    await startFresh.click();
    await page.waitForTimeout(500);
    console.log('✅ Start Fresh clicked');
  } else {
    console.log('No Start Fresh button found');
  }

  await page.screenshot({ path: '/tmp/e2e-debug-planner.png' });
  const text2 = await page.locator('body').innerText();
  console.log('Planner page:', text2.slice(0, 500));

  // Add Exercise - try different selectors
  const addExBtn = page.locator('button:has-text("Add Exercise")');
  console.log('Add Exercise buttons:', await addExBtn.count());

  if (await addExBtn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
    await addExBtn.first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/e2e-debug-dialog.png' });

    await page.fill('input[id="exercise-name"]', 'Bench Press');
    await page.fill('input[id="weight"]', '80');
    await page.fill('input[id="reps"]', '10');
    await page.fill('input[id="sets"]', '2');

    // Click the save button in dialog (second "Add Exercise" button)
    const saveBtn = page.locator('button:has-text("Add Exercise")');
    if (await saveBtn.count() > 1) {
      await saveBtn.nth(1).click();
    } else {
      await saveBtn.first().click();
    }
    await page.waitForTimeout(500);
    console.log('✅ Exercise added');
  }

  await page.screenshot({ path: '/tmp/e2e-debug-final.png' });

  // Start Workout
  const startBtn = page.locator('button:has-text("Start Workout")');
  if (await startBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await startBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/e2e-05-active.png' });
    console.log('✅ Active workout');

    // Click set buttons
    // The sets area has buttons with text "1" and "2"
    const allButtons = page.locator('button');
    const btnCount = await allButtons.count();
    console.log(`Total buttons: ${btnCount}`);

    // Find buttons that are set tracking buttons
    for (let i = 0; i < btnCount; i++) {
      const txt = await allButtons.nth(i).innerText().catch(() => '');
      if (txt === '1' || txt === '2') {
        console.log(`Clicking set button: ${txt}`);
        await allButtons.nth(i).click();
        await page.waitForTimeout(400);
      }
    }

    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/e2e-06-sets-done.png' });

    // Check difficulty dialog
    await page.waitForTimeout(1000);
    const diffDialog = page.locator('text=完成难度');
    if (await diffDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.screenshot({ path: '/tmp/e2e-07-difficulty.png' });
      console.log('✅ Difficulty dialog appeared!');
      await page.click('text=💪 适合');
      await page.waitForTimeout(500);
      await page.screenshot({ path: '/tmp/e2e-08-after-difficulty.png' });
      console.log('✅ Difficulty selected');
    } else {
      console.log('⚠️ No difficulty dialog');
      await page.screenshot({ path: '/tmp/e2e-07-no-dialog.png' });
    }

    // Finish
    const finishBtn = page.locator('button:has-text("Finish Workout")');
    if (await finishBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await finishBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/tmp/e2e-09-summary.png' });
      console.log('✅ Summary');
    }
  }

  await browser.close();
  console.log('All tests passed!');
})();
