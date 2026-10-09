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

console.log('🚀 Setting up Capacitor for Android...\n');

try {
  const configPath = path.join(root, 'capacitor.config.ts');
  if (!fs.existsSync(configPath)) {
    console.log('❌ capacitor.config.ts not found.');
    process.exit(1);
  }

  console.log('📦 Building web app...');
  execSync('npm run build', { stdio: 'inherit' });

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
