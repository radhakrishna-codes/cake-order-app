import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

console.log('Building web assets for iOS...')
execSync('vite build', { cwd: root, stdio: 'inherit' })

console.log('Syncing to native iOS project...')
execSync('npx cap sync ios', { cwd: root, stdio: 'inherit' })

const apiUrl =
  process.env.VITE_API_URL ??
  (() => {
    try {
      const envProduction = readFileSync(join(root, '.env.production'), 'utf8')
      const match = envProduction.match(/^VITE_API_URL=(.+)$/m)
      return match?.[1]?.trim() ?? ''
    } catch {
      return ''
    }
  })()

const buildInfoPath = join(root, 'ios', 'build-info.json')
mkdirSync(join(root, 'ios'), { recursive: true })
writeFileSync(
  buildInfoPath,
  JSON.stringify(
    {
      builtAt: new Date().toISOString(),
      apiUrl: apiUrl || '(not set — add VITE_API_URL to .env.production)',
    },
    null,
    2,
  ),
)

console.log('')
console.log('iOS project updated.')
console.log('')
console.log('Next steps (requires Mac + Xcode + Apple Developer account):')
console.log('  1) pnpm open:ios')
console.log('  2) In Xcode: select your Team under Signing & Capabilities')
console.log('  3) Product → Archive → Distribute App')
console.log('     - TestFlight: share with testers')

