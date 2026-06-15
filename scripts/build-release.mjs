import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const distDir = join(root, 'dist')
const releaseDir = join(root, 'releases', 'cake-order-app')
const logoSource = join(root, 'src', 'assets', 'rajaranilogo.png')
const touchIcon = join(root, 'public', 'apple-touch-icon.png')

mkdirSync(join(root, 'public'), { recursive: true })
cpSync(logoSource, touchIcon)

console.log('Building production app...')
execSync('vite build', { cwd: root, stdio: 'inherit' })

rmSync(releaseDir, { recursive: true, force: true })
mkdirSync(releaseDir, { recursive: true })
cpSync(distDir, releaseDir, { recursive: true })

let apiUrl = process.env.VITE_API_URL ?? ''
if (!apiUrl) {
  try {
    const envProduction = readFileSync(join(root, '.env.production'), 'utf8')
    const match = envProduction.match(/^VITE_API_URL=(.+)$/m)
    apiUrl = match?.[1]?.trim() ?? ''
  } catch {
    apiUrl = ''
  }
}

const buildInfo = {
  builtAt: new Date().toISOString(),
  apiUrl: apiUrl || '(not set — add VITE_API_URL to .env.production)',
  installHint:
    'Host this folder on HTTPS, open in iPhone/iPad Safari, then Share → Add to Home Screen.',
}

writeFileSync(join(releaseDir, 'build-info.json'), `${JSON.stringify(buildInfo, null, 2)}\n`)

console.log('')
console.log('Release app ready at:')
console.log(`  ${releaseDir}`)
console.log('')
console.log('Next steps:')
console.log('  1. pnpm preview:app   (test on Mac + iPhone on same Wi-Fi)')
console.log('  2. Deploy releases/cake-order-app to Vercel/Netlify for HTTPS install')
