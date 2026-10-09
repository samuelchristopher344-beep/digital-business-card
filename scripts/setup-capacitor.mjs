#!/usr/bin/env node

/**
 * Setup script to initialize Capacitor and Android project.
 * Run after: npm install
 * Usage: node scripts/setup-capacitor.mjs
 *
 * On CI / GitHub Actions the same steps are automated by
 * .github/workflows/build-android.yml
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const androidDir = path.join(root, 'android');
const webDir = path.join(root, '.output', 'public');

console.log('🚀 Setting up Capacitor for Android...\n');

try {
  const configPath = path.join(root, 'capacitor.config.ts');
  if (!fs.existsSync(configPath)) {
    console.log('❌ capacitor.config.ts not found.');
    process.exit(1);
  }

  console.log('📦 Building web app...');
  execSync('npm run build', { stdio: 'inherit' });

  if (!fs.existsSync(webDir)) {
    console.log('⚠️  .output/public not found after build — creating minimal fallback');
    fs.mkdirSync(webDir, { recursive: true });
    const indexPath = path.join(webDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(
        indexPath,
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Calling Card</title>
  <script>window.location.replace('https://digital-business-card.vercel.app');</script>
</head>
<body><p>Loading Calling Card…</p></body>
</html>
`,
      );
    }
  } else {
    console.log('✅ Found web assets at .output/public');
  }

  if (!fs.existsSync(androidDir)) {
    console.log('\n📱 Adding Android platform...');
    execSync('npx cap add android', { stdio: 'inherit' });
  } else {
    console.log('\n📱 Android platform already exists, skipping add.');
  }

  console.log('\n🔄 Syncing web assets to Android...');
  execSync('npx cap sync android', { stdio: 'inherit' });

  console.log('\n✅ Capacitor setup complete!');
  console.log('\nNext steps:');
  console.log('  • Open Android Studio:  npx cap open android');
  console.log('  • Run on device/emulator: npx cap run android');
  console.log('  • Or build APK manually:  cd android && ./gradlew assembleDebug');
  console.log('\nOr just let GitHub Actions build the APK for you');
  console.log('  (Actions → Build Android APK → download artifact).');
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
