import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'

const BRAVE_PATH = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'
const OUTPUT_DIR = path.resolve('docs/screenshots')

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

async function run() {
  console.log('Launching Brave in headless mode...')
  const browser = await puppeteer.launch({
    executablePath: BRAVE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,1024']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 1024, deviceScaleFactor: 2 })

  console.log('Navigating to ATS Matcher...')
  await page.goto('http://localhost:4173/ATS-Matcher/', { waitUntil: 'networkidle0' })

  // 1. Click "Carregar Exemplo"
  console.log('Clicking "Carregar Exemplo"...')
  const loadSampleBtn = await page.waitForSelector('button ::-p-text(Carregar Exemplo)')
  if (loadSampleBtn) {
    await loadSampleBtn.click()
  } else {
    // fallback selector
    const buttons = await page.$$('button')
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b)
      if (text.includes('Carregar Exemplo')) {
        await b.click()
        break
      }
    }
  }

  await new Promise(r => setTimeout(r, 600))

  // Capture Image 1: Input section
  console.log('Capturing imagem-input.png...')
  const inputSection = await page.$('section.space-y-6') || await page.$('main')
  if (inputSection) {
    await inputSection.screenshot({
      path: path.join(OUTPUT_DIR, 'imagem-input.png')
    })
  } else {
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'imagem-input.png')
    })
  }

  // 2. Click "Analisar e Otimizar para ATS"
  console.log('Clicking "Analisar e Otimizar para ATS"...')
  const analyzeBtn = await page.waitForSelector('button ::-p-text(Analisar e Otimizar para ATS)')
  if (analyzeBtn) {
    await analyzeBtn.click()
  } else {
    const buttons = await page.$$('button')
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b)
      if (text.includes('Analisar')) {
        await b.click()
        break
      }
    }
  }

  // Wait for results to render
  console.log('Waiting for analysis results...')
  await page.waitForSelector('circle[stroke-dasharray]', { timeout: 5000 })
  await new Promise(r => setTimeout(r, 1200)) // allow circle animation to complete

  // Capture Image 2: Results dashboard
  console.log('Capturing imagem-dashboard.png...')
  const dashboard = await page.waitForSelector('section.no-print.space-y-6.pt-4')
  if (dashboard) {
    await dashboard.screenshot({
      path: path.join(OUTPUT_DIR, 'imagem-dashboard.png')
    })
  }

  // Capture Image 3: A4 Resume Document
  console.log('Capturing imagem-curriculo.png...')
  const resumeDoc = await page.waitForSelector('#ats-resume-document')
  if (resumeDoc) {
    // Scroll into view
    await resumeDoc.scrollIntoView()
    await new Promise(r => setTimeout(r, 400))
    await resumeDoc.screenshot({
      path: path.join(OUTPUT_DIR, 'imagem-curriculo.png')
    })
  }

  await browser.close()
  console.log('All screenshots captured successfully!')
}

run().catch(err => {
  console.error('Error capturing screenshots:', err)
  process.exit(1)
})
