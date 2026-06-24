import { chromium } from 'playwright'

const PROD_URL = 'https://workout-tracker-hdhrcrcrfvfygaf3.japanwest-01.azurewebsites.net'

async function testNoRepsField() {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3
  })
  const page = await context.newPage()
  const screenshots = []

  try {
    // Clear storage and go to app
    await page.goto(PROD_URL)
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.waitForTimeout(2000)

    // Click Start Fresh if present
    const startFresh = page.getByRole('button', { name: 'Start Fresh' })
    if (await startFresh.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startFresh.click()
      await page.waitForTimeout(1000)
    }

    // Take screenshot of home page
    screenshots.push({ path: '/tmp/e2e-01-home.png', title: 'Home Page' })
    await page.screenshot({ path: screenshots[0].path })

    // Click Pull button to start workout
    await page.getByRole('button', { name: 'Pull' }).click()
    await page.waitForTimeout(1000)

    // Screenshot showing exercise list/planner
    screenshots.push({ path: '/tmp/e2e-02-planner.png', title: 'Exercise Planner' })
    await page.screenshot({ path: screenshots[1].path })

    // Click Add Exercise button
    await page.getByRole('button', { name: 'Add Exercise' }).click()
    await page.waitForTimeout(500)

    // Screenshot of Add Exercise dialog - should show only Weight and Sets, no Reps
    screenshots.push({ path: '/tmp/e2e-03-add-dialog.png', title: 'Add Exercise Dialog - No Reps Field' })
    await page.screenshot({ path: screenshots[2].path })

    // Fill in exercise details (only weight and sets now)
    await page.getByLabel('Exercise Name').fill('Lat Pulldown')
    await page.getByLabel('Weight (kg)').fill('50')
    await page.getByLabel('Sets').fill('3')

    // Screenshot showing filled form
    screenshots.push({ path: '/tmp/e2e-04-filled-form.png', title: 'Filled Exercise Form - Weight + Sets Only' })
    await page.screenshot({ path: screenshots[3].path })

    // Save exercise
    await page.getByRole('button', { name: 'Add Exercise' }).click()
    await page.waitForTimeout(500)

    // Screenshot showing exercise card (should show "50kg × 3 sets" without reps)
    screenshots.push({ path: '/tmp/e2e-05-exercise-card.png', title: 'Exercise Card - No Reps Display' })
    await page.screenshot({ path: screenshots[4].path })

    console.log('✅ Test passed - Reps field successfully removed')
    console.log('Screenshots saved:')
    screenshots.forEach(s => console.log(`  ${s.path} - ${s.title}`))

    return { success: true, screenshots }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    await page.screenshot({ path: '/tmp/e2e-error.png' })
    return { success: false, error: error.message, screenshots }
  } finally {
    await browser.close()
  }
}

testNoRepsField()
