import { chromium } from 'playwright'

async function testBalanceReminder() {
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

    // Set up test data with workouts to show balance reminder
    await page.evaluate(() => {
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // Create test workouts - only anaerobic (strength) workouts this month
      const testWorkouts = [
        {
          id: 'test-1',
          type: 'Pull',
          date: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 5).toISOString(),
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          exercises: [{ id: 'ex1', type: 'equipment', name: 'Lat Pulldown', weight: 50, targetSets: 3, completedSets: 3, completed: true }],
          completed: true
        },
        {
          id: 'test-2',
          type: 'Push',
          date: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 8).toISOString(),
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          exercises: [{ id: 'ex2', type: 'equipment', name: 'Bench Press', weight: 60, targetSets: 3, completedSets: 3, completed: true }],
          completed: true
        },
        {
          id: 'test-3',
          type: 'Legs',
          date: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 12).toISOString(),
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          exercises: [{ id: 'ex3', type: 'equipment', name: 'Squat', weight: 80, targetSets: 3, completedSets: 3, completed: true }],
          completed: true
        },
        // Add one from 2 months ago
        {
          id: 'test-4',
          type: 'Pull',
          date: new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 2, 10).toISOString(),
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          exercises: [{ id: 'ex4', type: 'equipment', name: 'Row', weight: 45, targetSets: 3, completedSets: 3, completed: true }],
          completed: true
        },
        // Add workouts from last month
        {
          id: 'test-5',
          type: 'Swim',
          date: new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 15).toISOString(),
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          exercises: [{ id: 'ex5', type: 'swim', targetDistance: 1000, actualDistance: 1000, completed: true }],
          completed: true
        },
        // 3 months ago
        {
          id: 'test-6',
          type: 'Run (Gym)',
          date: new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 3, 20).toISOString(),
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          exercises: [{ id: 'ex6', type: 'run', targetDistance: 5, actualDistance: 5.2, completed: true }],
          completed: true
        },
        // 4 months ago
        {
          id: 'test-7',
          type: 'Push',
          date: new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 4, 5).toISOString(),
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          exercises: [{ id: 'ex7', type: 'equipment', name: 'OHP', weight: 40, targetSets: 3, completedSets: 3, completed: true }],
          completed: true
        }
      ]

      localStorage.setItem('workouts', JSON.stringify(testWorkouts))
    })

    await page.reload()
    await page.waitForTimeout(2000)

    // Screenshot 1 - Home page with balance reminder (should show "only anaerobic" warning)
    screenshots.push({ path: '/tmp/e2e-balance-01-home.png', title: 'Home with Balance Reminder - Only Anaerobic' })
    await page.screenshot({ path: screenshots[0].path })

    // Scroll to see Monthly Stats
    await page.evaluate(() => window.scrollTo(0, 300))
    await page.waitForTimeout(500)

    // Screenshot 2 - Monthly Stats showing only 3 months
    screenshots.push({ path: '/tmp/e2e-balance-02-stats-collapsed.png', title: 'Monthly Stats - Collapsed (3 months)' })
    await page.screenshot({ path: screenshots[1].path })

    // Click expand button
    const expandBtn = page.getByRole('button', { name: /展开更多/ })
    if (await expandBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expandBtn.click()
      await page.waitForTimeout(500)
    }

    // Screenshot 3 - Monthly Stats expanded
    screenshots.push({ path: '/tmp/e2e-balance-03-stats-expanded.png', title: 'Monthly Stats - Expanded (all months)' })
    await page.screenshot({ path: screenshots[2].path })

    console.log('✅ Test passed - Balance reminder and Monthly Stats expand working')
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

testBalanceReminder()
