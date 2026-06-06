#!/usr/bin/env node
// ────────────────────────────────────────────────────────────────────
// record.js — 用 Playwright 录制课件画布为 MP4 视频
//
// 用法:
//   node scripts/record.js                          # 交互式录制
//   node scripts/record.js --headless                # 无头模式
//   node scripts/record.js --out my-video.mp4        # 指定输出文件
//   node scripts/record.js --chapter 10              # 从指定章节开始
//   node scripts/record.js --dev                     # 使用 dev server
//   node scripts/record.js --duration 120            # 录制时长(秒)
//   node scripts/record.js --url "http://..."        # 指定 URL
//
// 环境变量:
//   RECORD_URL      课件页面 URL (覆盖 --dev)
//   RECORD_DURATION 录制时长秒数
//
// 依赖: playwright (npx playwright install chromium)
// ────────────────────────────────────────────────────────────────────
import { chromium } from 'playwright';
import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const args = process.argv.slice(2);
let headless = false;
let outFile = path.join(process.cwd(), 'course-recording.mp4');
let chapter = 0;
let devMode = false;
let duration = 0;
let resolution = '1920x1080';
let url = '';

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--headless': headless = true; break;
    case '--out': outFile = args[++i]; break;
    case '--chapter': chapter = parseInt(args[++i]) || 0; break;
    case '--dev': devMode = true; break;
    case '--duration': duration = parseInt(args[++i]) || 0; break;
    case '--resolution': resolution = args[++i]; break;
    case '--url': url = args[++i]; break;
    case '-h': case '--help':
      console.log('用法: node scripts/record.js [选项]');
      console.log('  --headless     无头模式');
      console.log('  --out FILE      输出文件 (默认 ./course-recording.mp4)');
      console.log('  --chapter N     从第 N 章开始 (默认 0)');
      console.log('  --dev           使用 dev server (localhost:5173)');
      console.log('  --duration SECS 录制时长秒数');
      console.log('  --url URL       课件页面 URL (覆盖 --dev)');
      console.log('  --resolution WxH 录制分辨率 (默认 1920x1080)');
      process.exit(0);
  }
}

// ── 确定 URL ──────────────────────────────────────────────────────
if (url) {
  // use as-is
} else if (process.env.RECORD_URL) {
  url = process.env.RECORD_URL;
} else if (devMode) {
  url = `http://localhost:5173/?auto=1&chapter=${chapter}`;
  // Start dev server if needed
  try {
    const resp = await fetch(url);
    if (resp.status !== 200) throw new Error('not ready');
  } catch {
    console.log('  dev server 未运行，正在启动...');
    const cwd = path.resolve(import.meta.dirname, '..');
    const dev = spawn('npm', ['run', 'dev'], { cwd, stdio: 'pipe', detached: false });
    dev.stderr.on('data', d => {
      if (d.toString().includes('Local:')) console.log('  ✓ dev server 已就绪');
    });
    // Wait for server
    for (let i = 0; i < 30; i++) {
      try {
        const r = await fetch(url);
        if (r.status === 200) break;
      } catch {}
      await new Promise(r => setTimeout(r, 1000));
    }
  }
} else {
  console.error('✗ 未指定 URL。使用 --dev 或 --url');
  process.exit(1);
}

// ── 确定时长 ──────────────────────────────────────────────────────
if (!duration) {
  duration = parseInt(process.env.RECORD_DURATION || '0') || 300;
}

const [w, h] = resolution.split('x').map(Number);

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  Course Recording (Playwright)');
console.log(`║  URL: ${url}`);
console.log(`║  Output: ${outFile}`);
console.log(`║  Resolution: ${w}×${h}`);
console.log(`║  Duration: ${duration}s`);
console.log(`║  Mode: ${headless ? 'headless' : 'visible'}`);
console.log('╚═══════════════════════════════════════════════════════════╝');

// ── 录制 ──────────────────────────────────────────────────────────
const browser = await chromium.launch({ headless });
const context = await browser.newContext({
  viewport: { width: w, height: h },
  recordVideo: {
    dir: path.dirname(outFile),
    size: { width: w, height: h },
  },
});

const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle' });

// Click once to start auto mode (browser autoplay policy)
await page.click('body');
console.log('  ▶ 录制开始...');

// Wait for duration
const start = Date.now();
const checkInterval = setInterval(() => {
  const elapsed = Math.round((Date.now() - start) / 1000);
  if (elapsed % 30 === 0) console.log(`  ... ${elapsed}s / ${duration}s`);
}, 30000);

await new Promise(r => setTimeout(r, duration * 1000));
clearInterval(checkInterval);

// Close → video saved
await context.close();
await browser.close();

// Find the recorded .webm file and convert to .mp4
const videoDir = path.dirname(outFile);
const files = fs.readdirSync(videoDir).filter(f => f.endsWith('.webm')).sort();
const webm = files[files.length - 1]; // newest
const webmPath = path.join(videoDir, webm);

if (outFile.endsWith('.mp4')) {
  console.log('  ⟳ 转换 webm → mp4 ...');
  execSync(`ffmpeg -y -i "${webmPath}" -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p "${outFile}" 2>/dev/null`, { stdio: 'inherit' });
  fs.unlinkSync(webmPath);
  console.log(`  ✅ 录制完成: ${outFile}`);
} else {
  fs.renameSync(webmPath, outFile);
  console.log(`  ✅ 录制完成: ${outFile}`);
}

const size = (fs.statSync(outFile).size / 1024 / 1024).toFixed(1);
console.log(`  🎬 文件大小: ${size} MB`);
console.log(`  ⏱  时长: ${duration}s`);
