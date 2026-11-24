'use strict'
/*
 * Browser visual gate for the swipe-compare UI.
 * Run from the widget folder:
 *   NODE_PATH=C:/Users/Asus/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules node scripts/swipe-harness/gate.cjs
 * Screenshots go to dist-report/swipe-harness/shots/. Exit code 1 lists every failure.
 */
const fs = require('fs')
const http = require('http')
const path = require('path')
const { pathToFileURL } = require('url')
const { chromium } = require('playwright')

const WIDGET_ROOT = path.resolve(__dirname, '..', '..')
const REPORT_DIR = path.join(WIDGET_ROOT, 'dist-report', 'swipe-harness')
const SHOTS_DIR = path.join(REPORT_DIR, 'shots')
const SPIKE_FILE = path.join(__dirname, 'spike.html')

const PAGES = ['ready', 'loading', 'error', 'popover']
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '390', width: 390, height: 844 }
]
const THEMES = ['dark', 'light']
const BACKDROPS = [
  { name: 'light', color: '#f2efe9' },
  { name: 'mid', color: '#8a8a8a' },
  { name: 'dark', color: '#101820' }
]
const SPIKE_TIMEOUT_MS = 90000
const MAX_TAB_PRESSES = 50

const failures = new Set()
const fail = (scope, message) => failures.add(`${scope}: ${message}`)

/* ------------------------------------------------------------------ in-page */

/** Static checks: sizes, text, contrast, wrapping, geometry, borders, popover. Runs inside the page. */
function staticChecks(backdropColor) {
  const out = []
  const rects = {}
  const map = document.querySelector('.harness-map')
  map.style.setProperty('background', backdropColor, 'important')
  const bar = document.querySelector('.agri-field-swipe-bar')
  const panel = document.querySelector('.agri-dashboard-compare-panel')
  const isShown = (el) => !!el && el.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true })
  const barShown = isShown(bar)
  const panelShown = isShown(panel)
  const describe = (el) => {
    const cls = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean).join('.')
    return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}${el.textContent ? `[${el.textContent.trim().slice(0, 18)}]` : ''}`
  }
  const rectOf = (el) => {
    const r = el.getBoundingClientRect()
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }
  }

  // buttons >= 40x40
  document.querySelectorAll('button').forEach((b) => {
    if (!isShown(b)) return
    const r = b.getBoundingClientRect()
    if (r.width < 39.5 || r.height < 39.5) out.push(`button ${describe(b)} is ${r.width.toFixed(1)}x${r.height.toFixed(1)} (<40x40)`)
  })

  // text nodes: size and contrast
  const parseColor = (c) => {
    const m = /^(?:rgba?|color)\((.+)\)$/.exec(c.trim())
    if (!m) return null
    const parts = m[1].replace('srgb', '').split(/[\s,/]+/).filter(Boolean).map(parseFloat)
    const isUnit = c.startsWith('color(')
    const k = isUnit ? 255 : 1
    return { r: parts[0] * k, g: parts[1] * k, b: parts[2] * k, a: parts.length > 3 ? parts[3] : 1 }
  }
  const over = (top, base) => {
    const a = top.a + base.a * (1 - top.a)
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }
    const mix = (t, b2) => (t * top.a + b2 * base.a * (1 - top.a)) / a
    return { r: mix(top.r, base.r), g: mix(top.g, base.g), b: mix(top.b, base.b), a }
  }
  const lum = (c) => {
    const f = (v) => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b)
  }
  const effectiveBg = (el) => {
    const chain = []
    for (let n = el; n; n = n.parentElement) chain.unshift(n)
    let acc = { r: 255, g: 255, b: 255, a: 1 }
    chain.forEach((n) => {
      const bg = parseColor(getComputedStyle(n).backgroundColor)
      if (bg && bg.a > 0) acc = over(bg, acc)
    })
    return acc
  }
  const inScope = (el) => (barShown && bar.contains(el)) || (panelShown && panel.contains(el))
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const seen = new Set()
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.nodeValue.trim()) continue
    const el = node.parentElement
    if (!el || ['SCRIPT', 'STYLE', 'TITLE'].includes(el.tagName) || !isShown(el)) continue
    const cs = getComputedStyle(el)
    const size = parseFloat(cs.fontSize)
    if (size < 11.99) out.push(`text "${node.nodeValue.trim().slice(0, 20)}" in ${describe(el)} is ${size}px (<12px)`)
    if (!inScope(el) || el.closest('button:disabled') || seen.has(el)) continue
    seen.add(el)
    const fg = parseColor(cs.color)
    const bg = effectiveBg(el)
    const text = over(fg, bg)
    const l1 = lum(text)
    const l2 = lum(bg)
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
    if (ratio < 4.5) out.push(`contrast ${ratio.toFixed(2)}:1 (<4.5) for ${describe(el)} color ${cs.color} on ${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)}`)
  }

  // wrapping and clipping
  const lineCount = (el) => {
    const range = document.createRange()
    range.selectNodeContents(el)
    const tops = []
    Array.from(range.getClientRects()).forEach((r) => {
      if (r.width > 0 && !tops.some((t) => Math.abs(t - r.top) < 4)) tops.push(r.top)
    })
    return tops.length
  }
  document.querySelectorAll('.agri-field-swipe-chip, .agri-field-swipe-caption, .agri-field-swipe-error, .agri-field-swipe-retry, .agri-field-swipe-close').forEach((el) => {
    if (!isShown(el)) return
    if (el.scrollWidth > el.clientWidth + 0.5) out.push(`clipped ${describe(el)} scrollWidth ${el.scrollWidth} > clientWidth ${el.clientWidth}`)
    if (!el.matches('.agri-field-swipe-close') && lineCount(el) > 1) out.push(`wrapped text in ${describe(el)} (${lineCount(el)} lines)`)
    if (el.matches('.agri-field-swipe-chip') && el.getBoundingClientRect().height > 41) out.push(`chip taller than 40px: ${describe(el)}`)
  })

  // geometry
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight
  const mapRect = map.getBoundingClientRect()
  const inside = (name, r) => {
    if (r.left < -0.5 || r.top < -0.5 || r.right > vw + 0.5 || r.bottom > vh + 0.5) out.push(`${name} outside viewport (${[r.left, r.top, r.right, r.bottom].map(Math.round)} in ${vw}x${vh})`)
    if (r.left < mapRect.left - 0.5 || r.top < mapRect.top - 0.5 || r.right > mapRect.right + 0.5 || r.bottom > mapRect.bottom + 0.5) out.push(`${name} outside map box`)
  }
  const hit = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5
  const stack = Array.from(document.querySelectorAll('.agri-dashboard-compare-control, .agri-dashboard-map-zoom-button')).filter(isShown).map(rectOf)
  if (barShown) {
    rects.bar = rectOf(bar)
    inside('bar', rects.bar)
    if (stack.some((s) => hit(rects.bar, s))) out.push('bar overlaps the left button stack')
  }
  if (panelShown) {
    rects.panel = rectOf(panel)
    inside('popover', rects.panel)
    if (stack.some((s) => hit(rects.panel, s))) out.push('popover overlaps the left button stack')
  }

  // border / shadow duplicates, nearest decorated ancestor within scope
  const decor = (el) => {
    const cs = getComputedStyle(el)
    const hasBorder = ['Top', 'Right', 'Bottom', 'Left'].some((s) => {
      const color = parseColor(cs[`border${s}Color`])
      return parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== 'none' && color && color.a > 0
    })
    const shadows = cs.boxShadow === 'none' ? [] : cs.boxShadow.split(/,(?![^(]*\))/).filter((s) => !/inset/.test(s))
    return { hasBorder, hasShadow: shadows.length > 0, cs }
  }
  ;[barShown ? bar : null, panelShown ? panel : null].filter(Boolean).forEach((root) => {
    root.querySelectorAll('*').forEach((el) => {
      if (el.closest('svg') && el.tagName !== 'svg') return
      const d = decor(el)
      if (!d.hasBorder && !d.hasShadow) return
      for (let p = el.parentElement; p && root.contains(p) || p === root; p = p.parentElement) {
        const pd = decor(p)
        if (pd.hasBorder || pd.hasShadow) {
          out.push(`double decoration: ${describe(p)} (border:${pd.hasBorder} shadow:${pd.hasShadow}) wraps ${describe(el)} (border:${d.hasBorder} shadow:${d.hasShadow})`)
          break
        }
        if (p === root) break
      }
    })
  })

  // popover scrolling and empty space
  if (panelShown) {
    const scrollers = [panel, ...panel.querySelectorAll('*')].filter((el) => ['auto', 'scroll'].includes(getComputedStyle(el).overflowY))
    if (scrollers.length > 1) out.push(`popover has ${scrollers.length} scroll containers: ${scrollers.map(describe).join(' | ')}`)
    const legend = panel.querySelector('.agri-dashboard-compare-legend')
    if (legend && panel.scrollHeight <= panel.clientHeight + 1) {
      const gap = panel.getBoundingClientRect().bottom - legend.getBoundingClientRect().bottom
      if (gap > 16.5) out.push(`popover has ${gap.toFixed(1)}px empty space below the legend (>16px)`)
    }
  }
  return { out, rects }
}

/** Snapshot of focus-relevant style for every element, stored on window. Runs inside the page. */
function snapshotBase() {
  const pseudo = (el, p) => {
    const cs = getComputedStyle(el, p)
    return `${cs.content}|${cs.borderTopWidth}|${cs.outlineStyle}|${cs.boxShadow}`
  }
  const sig = (el) => {
    const cs = getComputedStyle(el)
    return [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.borderTopWidth, cs.borderTopColor, pseudo(el, '::before'), pseudo(el, '::after')].join('~')
  }
  window.__sig = sig
  window.__base = new Map()
  document.querySelectorAll('*').forEach((el) => window.__base.set(el, sig(el)))
}

/** Checks the focus indicator of document.activeElement. Runs inside the page. */
function focusCheck() {
  const el = document.activeElement
  if (!el || el === document.body) return null
  const out = []
  const cls = (n) => `${n.tagName.toLowerCase()}.${(n.getAttribute('class') || '').split(/\s+/).filter(Boolean).join('.')}`
  const cs = getComputedStyle(el)
  const base = window.__base.get(el)
  const label = `${cls(el)}[${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 16)}]`
  const hasOutline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0
  if (!hasOutline) out.push(`${label} has no outline when Tab-focused`)
  if (hasOutline && parseFloat(cs.outlineWidth) < 2) out.push(`${label} outline thinner than 2px`)
  const baseShadow = base.split('~')[3]
  if (cs.boxShadow !== baseShadow) out.push(`${label} adds a box-shadow focus ring (${cs.boxShadow})`)
  ;['::before', '::after'].forEach((p) => {
    const ps = getComputedStyle(el, p)
    const rendered = ps.content !== 'none' && ps.content !== 'normal'
    if (rendered && (parseFloat(ps.borderTopWidth) > 0 || ps.outlineStyle !== 'none')) out.push(`${label} ${p} draws a frame`)
  })
  for (let p = el.parentElement; p && !p.classList.contains('harness-map'); p = p.parentElement) {
    if (window.__sig(p) !== window.__base.get(p)) out.push(`wrapper ${cls(p)} changes style when ${label} is focused`)
    const pcs = getComputedStyle(p)
    if (pcs.outlineStyle !== 'none' && parseFloat(pcs.outlineWidth) > 0) out.push(`wrapper ${cls(p)} shows an outline`)
  }
  return { label, out, key: cls(el) }
}

/* ----------------------------------------------------------------- harness */

async function runHarnessPages(browser) {
  const popoverRects = {}
  const barRects = {}
  fs.mkdirSync(SHOTS_DIR, { recursive: true })
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
      const page = await context.newPage()
      for (const name of PAGES) {
        const scope = `${name} ${vp.name} ${theme}`
        const file = path.join(REPORT_DIR, `${name}.html`)
        if (!fs.existsSync(file)) {
          fail(scope, `missing harness page ${file}`)
          continue
        }
        await page.goto(`${pathToFileURL(file).href}?theme=${theme}`)
        await page.waitForLoadState('load')
        await page.screenshot({ path: path.join(SHOTS_DIR, `${name}-${vp.name}-${theme}.png`) })

        for (const backdrop of BACKDROPS) {
          const result = await page.evaluate(staticChecks, backdrop.color)
          result.out.forEach((m) => fail(`${scope} (backdrop ${backdrop.name})`, m))
          if (backdrop.name === 'mid') {
            if (result.rects.bar) barRects[`${vp.name}-${theme}-${name}`] = result.rects.bar
            if (result.rects.panel) popoverRects[`${vp.name}-${theme}`] = result.rects.panel
          }
        }

        await page.reload()
        await page.evaluate(snapshotBase)
        const focused = new Set()
        for (let i = 0; i < MAX_TAB_PRESSES; i += 1) {
          await page.keyboard.press('Tab')
          const res = await page.evaluate(focusCheck)
          if (!res) break
          if (focused.has(res.label)) break
          focused.add(res.label)
          res.out.forEach((m) => fail(scope, m))
        }
        const reached = Array.from(focused).join(' ')
        // In the error state the compare chip is replaced by error + Retry, and
        // under 480px the main chip is hidden on purpose (field-swipe.css).
        const expected = name === 'popover'
          ? ['agri-dashboard-compare-button', 'agri-dashboard-compare-day', 'Previous month']
          : name === 'error'
            ? ['agri-field-swipe-retry', 'agri-field-swipe-close']
            : ['agri-field-swipe-chip', 'agri-field-swipe-close']
        expected.forEach((needle) => {
          if (!reached.includes(needle)) fail(scope, `Tab never reached a control matching "${needle}"`)
        })
      }
      await context.close()
    }
  }
  // bar must never collide with the popover at the same viewport and theme
  Object.keys(barRects).forEach((key) => {
    const [vpName, theme] = key.split('-')
    const pop = popoverRects[`${vpName}-${theme}`]
    const bar = barRects[key]
    if (pop && bar.left < pop.right - 0.5 && pop.left < bar.right - 0.5 && bar.top < pop.bottom - 0.5 && pop.top < bar.bottom - 0.5) {
      fail(`bar ${key} vs popover`, 'bar overlaps the popover')
    }
  })
}

/* ------------------------------------------------------------------- spike */

const isRed = (c) => c.r - c.g > 80 && c.r - c.b > 80
const isBlue = (c) => c.b - c.r > 80 && c.b - c.g > 40
const isBasemap = (c) => !isRed(c) && !isBlue(c)

function samplePixels(args) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const g = canvas.getContext('2d')
      g.drawImage(img, 0, 0)
      resolve(args.points.map((p) => {
        const d = g.getImageData(Math.round(p.x), Math.round(p.y), 1, 1).data
        return { r: d[0], g: d[1], b: d[2] }
      }))
    }
    img.onerror = () => reject(new Error('decode failed'))
    img.src = `data:image/png;base64,${args.base64}`
  })
}

function geometryInfo() {
  const view = window.__spikeView
  const R = 6378137
  const ext = view.extent
  const toScreen = (lon, lat) => {
    const mx = (lon * Math.PI * R) / 180
    const my = R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
    return { x: ((mx - ext.xmin) / (ext.xmax - ext.xmin)) * view.width, y: ((ext.ymax - my) / (ext.ymax - ext.ymin)) * view.height }
  }
  const ring = [[69.24, 41.25], [69.36, 41.27], [69.33, 41.36], [69.25, 41.33]].map(([lon, lat]) => toScreen(lon, lat))
  const xs = ring.map((p) => p.x)
  const ys = ring.map((p) => p.y)
  const handle = document.querySelector('.esri-swipe__handle') || document.querySelector('.esri-swipe__container')
  const r = handle ? handle.getBoundingClientRect() : null
  return {
    width: view.width,
    height: view.height,
    position: window.__spike.swipe.position,
    polyLeft: Math.min(...xs),
    polyRight: Math.max(...xs),
    polyTop: Math.min(...ys),
    polyBottom: Math.max(...ys),
    handle: r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null
  }
}

async function sampleScene(page, mkPoints) {
  const info = await page.evaluate(geometryInfo)
  const points = mkPoints(info)
  const buf = await page.screenshot()
  const colors = await page.evaluate(samplePixels, { base64: buf.toString('base64'), points })
  return { info, colors }
}

/** Polls until check(colors) returns no problem or time runs out; returns the last problem. */
async function expectScene(page, mkPoints, check, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  let problem = 'not sampled'
  while (Date.now() < deadline) {
    const { info, colors } = await sampleScene(page, mkPoints)
    problem = check(colors, info)
    if (!problem) return null
    await page.waitForTimeout(600)
  }
  return problem
}

const insidePoints = (info) => {
  const cy = (info.polyTop + info.polyBottom) / 2
  const dx = Math.min(30, (info.polyRight - info.polyLeft) / 4)
  const mid = info.width * (info.position / 100)
  return [{ x: mid - dx, y: cy }, { x: mid + dx, y: cy }]
}
const outsidePoints = (info) => {
  const y = Math.max(info.polyTop - 60, 90)
  const mid = info.width * (info.position / 100)
  return [{ x: mid - 40, y }, { x: mid + 40, y }]
}
const polygonSidePoints = (info) => {
  const cy = (info.polyTop + info.polyBottom) / 2
  const w = info.polyRight - info.polyLeft
  return [{ x: info.polyLeft + w * 0.3, y: cy }, { x: info.polyRight - w * 0.3, y: cy }]
}

function startServer() {
  const html = fs.readFileSync(SPIKE_FILE, 'utf8').replace('window.__spike={', 'window.__spikeView=view;window.__spike={')
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end(html)
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)))
}

async function drag(page, cdp, mode, from, toX) {
  if (mode === 'mouse') {
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move((from.x + toX) / 2, from.y, { steps: 8 })
    await page.mouse.move(toX, from.y, { steps: 8 })
    await page.mouse.up()
    return
  }
  const touch = (type, x) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y: from.y }] })
  await touch('touchStart', from.x)
  for (let i = 1; i <= 12; i += 1) await touch('touchMove', from.x + ((toX - from.x) * i) / 12)
  await touch('touchEnd', toX)
}

async function runSpike(browser) {
  const server = await startServer()
  const url = `http://127.0.0.1:${server.address().port}/spike.html`
  const context = await browser.newContext({ viewport: { width: 1200, height: 760 }, hasTouch: true })
  const page = await context.newPage()
  const scope = 'spike'
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    try {
      await page.waitForFunction(() => window.__spike && window.__spikeView, null, { timeout: SPIKE_TIMEOUT_MS })
    } catch (e) {
      const status = await page.evaluate(() => (document.getElementById('status') || {}).textContent).catch(() => 'n/a')
      fail(scope, `view never became ready (status "${status}"); is the ArcGIS CDN reachable?`)
      return
    }
    await page.waitForTimeout(1500)
    await page.screenshot({ path: path.join(SHOTS_DIR, 'spike-50.png') })

    const inside50 = await expectScene(page, insidePoints, ([l, r]) => {
      if (!isRed(l)) return `left of divider inside polygon is not layer A red (${JSON.stringify(l)})`
      if (!isBlue(r)) return `right of divider inside polygon is not layer B blue (${JSON.stringify(r)})`
      return null
    }, 30000)
    if (inside50) fail(scope, `50%: ${inside50}`)
    const outside50 = await expectScene(page, outsidePoints, (cs) => (cs.every(isBasemap) ? null : `outside the polygon a side shows layer colour ${JSON.stringify(cs)}`), 8000)
    if (outside50) fail(scope, `50%: ${outside50}`)

    const cdp = await context.newCDPSession(page)
    for (const step of [
      { mode: 'mouse', toRatio: 0.25, expected: isBlue, label: 'B blue', pos: 25 },
      { mode: 'touch', toRatio: 0.75, expected: isRed, label: 'A red', pos: 75 }
    ]) {
      const info = await page.evaluate(geometryInfo)
      if (!info.handle) {
        fail(scope, 'swipe handle element not found (.esri-swipe__handle)')
        break
      }
      await drag(page, cdp, step.mode, info.handle, info.width * step.toRatio)
      await page.waitForTimeout(600)
      const after = await page.evaluate(geometryInfo)
      if (Math.abs(after.position - step.pos) > 3) fail(scope, `${step.mode} drag: position ${after.position.toFixed(1)} (expected ~${step.pos})`)
      await page.screenshot({ path: path.join(SHOTS_DIR, `spike-${step.pos}-${step.mode}.png`) })
      const problem = await expectScene(page, polygonSidePoints, (cs) => (cs.every(step.expected) ? null : `after ${step.mode} drag to ${step.pos}% the polygon should show ${step.label} on both ends, got ${JSON.stringify(cs)}`), 20000)
      if (problem) fail(scope, problem)
      const outside = await expectScene(page, outsidePoints, (cs) => (cs.every(isBasemap) ? null : `outside the polygon at ${step.pos}% a side shows layer colour ${JSON.stringify(cs)}`), 8000)
      if (outside) fail(scope, outside)
    }
  } catch (e) {
    fail(scope, `unexpected error: ${e && e.message ? e.message : e}`)
  } finally {
    await context.close()
    server.close()
  }
}

/* -------------------------------------------------------------------- main */

async function main() {
  fs.mkdirSync(SHOTS_DIR, { recursive: true })
  const browser = await chromium.launch({ channel: 'chrome', args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] })
  try {
    await runHarnessPages(browser)
    await runSpike(browser)
  } finally {
    await browser.close()
  }
  if (failures.size > 0) {
    console.error(`GATE FAILED: ${failures.size} failure(s)`)
    Array.from(failures).sort().forEach((f) => console.error(` - ${f}`))
    process.exit(1)
  }
  console.log(`GATE PASSED. Screenshots: ${SHOTS_DIR}`)
}

main().catch((e) => {
  console.error('GATE ERROR', e)
  process.exit(1)
})
