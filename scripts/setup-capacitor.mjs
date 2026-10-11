#!/usr/bin/env node

/**
 * Setup Capacitor for Android and/or iOS.
 *
 * Usage:
 *   node scripts/setup-capacitor.mjs          # both platforms
 *   node scripts/setup-capacitor.mjs android  # Android only
 *   node scripts/setup-capacitor.mjs ios      # iOS only (needs macOS)
 *
 * CI automates the same steps in:
 *   .github/workflows/build-android.yml
 *   .github/workflows/build-ios.yml
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const root = process.cwd();
const androidDir = path.join(root, 'android');
const iosDir = path.join(root, 'ios');
const webDir = path.join(root, '.output', 'public');
const arg = (process.argv[2] || 'both').toLowerCase();
const wantAndroid = arg === 'both' || arg === 'android';
const wantIos = arg === 'both' || arg === 'ios';
const isMac = os.platform() === 'darwin';

console.log('🚀 Setting up Capacitor...\n');

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
  <script>window.location.replace('https://digital-business-card-samuelchristopher344-beep.vercel.app');</script>
</head>
<body><p>Loading Calling Card…</p></body>
</html>
`,
      );
    }
  } else {
    console.log('✅ Found web assets at .output/public');
  }

  if (wantAndroid) {
    if (!fs.existsSync(androidDir)) {
      console.log('\n📱 Adding Android platform...');
      execSync('npx cap add android', { stdio: 'inherit' });
    } else {
      console.log('\n📱 Android platform already exists, skipping add.');
    }
    console.log('🔄 Syncing Android...');
    execSync('npx cap sync android', { stdio: 'inherit' });
  }

  if (wantIos) {
    if (!isMac) {
      console.log('\n⚠️  iOS platform can only be added/built on macOS.');
      console.log('   Use GitHub Actions (Build iOS) or a Mac, then run:');
      console.log('   node scripts/setup-capacitor.mjs ios');
    } else {
      if (!fs.existsSync(iosDir)) {
        console.log('\n🍎 Adding iOS platform...');
        execSync('npx cap add ios', { stdio: 'inherit' });
      } else {
        console.log('\n🍎 iOS platform already exists, skipping add.');
      }
      console.log('🔄 Syncing iOS...');
      execSync('npx cap sync ios', { stdio: 'inherit' });
    }
  }

  console.log('\n✅ Capacitor setup complete!');
  console.log('\nNext steps:');
  if (wantAndroid) {
    console.log('  Android:  npx cap open android  |  npx cap run android');
  }
  if (wantIos && isMac) {
    console.log('  iOS:      npx cap open ios      |  npx cap run ios');
  }
  console.log('\nOr use GitHub Actions → Build Android APK / Build iOS');
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
