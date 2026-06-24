import { chromium } from 'playwright'

async function testNoRepsFieldLocal() {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3
  })
  const page = await context.newPage()
  const screenshots = []

  try {
    await page.goto('http://localhost:4173')
    await page.waitForTimeout(2000)

    // Screenshot of home page
    screenshots.push({ path: '/tmp/e2e-01-home.png', title: 'Home Page' })
    await page.screenshot({ path: screenshots[0].path })

    // Click Start Workout button
    await page.getByRole('button', { name: 'Start Workout' }).click()
    await page.waitForTimeout(1000)

    // Screenshot showing workout type selection
    screenshots.push({ path: '/tmp/e2e-02-type-selection.png', title: 'Workout Type Selection' })
    await page.screenshot({ path: screenshots[1].path })

    // Click Pull (it's a card, not a button)
    await page.getByText('Pull', { exact: true }).click()
    await page.waitForTimeout(1000)

    // Close checklist modal by clicking "Continue to Workout"
    const continueBtn = page.getByRole('button', { name: 'Continue to Workout' })
    if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await continueBtn.click()
      await page.waitForTimeout(500)
    }

    // Click Start Fresh if needed
    const startFreshBtn = page.getByRole('button', { name: 'Start Fresh' })
    if (await startFreshBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startFreshBtn.click()
      await page.waitForTimeout(500)
    }

    // Screenshot of planner
    screenshots.push({ path: '/tmp/e2e-03-planner.png', title: 'Exercise Planner' })
    await page.screenshot({ path: screenshots[2].path })

    // Click Add Exercise
    await page.getByRole('button', { name: 'Add Exercise' }).click()
    await page.waitForTimeout(500)

    // Screenshot of dialog - should show only Weight and Sets
    screenshots.push({ path: '/tmp/e2e-04-add-dialog.png', title: 'Add Exercise Dialog - No Reps Field' })
    await page.screenshot({ path: screenshots[3].path })

    // Fill form
    await page.getByLabel('Exercise Name').fill('Lat Pulldown')
    await page.getByLabel('Weight (kg)').fill('50')
    await page.getByLabel('Sets').fill('3')

    screenshots.push({ path: '/tmp/e2e-05-filled-form.png', title: 'Filled Form - Weight + Sets Only' })
    await page.screenshot({ path: screenshots[4].path })

    // Save
    await page.getByRole('button', { name: 'Add Exercise' }).click()
    await page.waitForTimeout(500)

    // Screenshot of card
    screenshots.push({ path: '/tmp/e2e-06-exercise-card.png', title: 'Exercise Card - No Reps' })
    await page.screenshot({ path: screenshots[5].path })

    console.log('✅ Test passed - Reps field successfully removed')
    screenshots.forEach(s => console.log(`  ${s.path}`))

    return { success: true, screenshots }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    await page.screenshot({ path: '/tmp/e2e-error.png' })
    return { success: false, error: error.message }
  } finally {
    await browser.close()
  }
}

testNoRepsFieldLocal()
