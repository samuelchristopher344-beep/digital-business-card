#!/usr/bin/env node

/**
 * Setup script to initialize Capacitor and Android project
 * Run this after: npm install
 * Usage: node scripts/setup-capacitor.mjs
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const androidDir = path.join(root, 'android');

console.log('🚀 Setting up Capacitor for Android...\n');

try {
  // Check if capacitor.config.ts exists
  const configPath = path.join(root, 'capacitor.config.ts');
  if (!fs.existsSync(configPath)) {
    console.log('❌ capacitor.config.ts not found. Please ensure it exists.');
    process.exit(1);
  }

  // Build the web app first
  console.log('📦 Building web app...');
  execSync('npm run build', { stdio: 'inherit' });

  // Initialize Capacitor project (idempotent)
  if (!fs.existsSync(androidDir)) {
    console.log('\n📱 Adding Android platform...');
    execSync('npx cap add android', { stdio: 'inherit' });
  } else {
    console.log('\n📱 Android platform already exists, skipping add.');
  }

  // Sync changes
  console.log('\n🔄 Syncing web assets to Android...');
  execSync('npx cap sync android', { stdio: 'inherit' });

  console.log('\n✅ Capacitor setup complete!');
  console.log('\nNext steps:');
  console.log('  1. Open Android Studio: npx cap open android');
  console.log('  2. Connect an Android device or emulator');
  console.log('  3. Run: npx cap run android');
  console.log('\nOr build an APK:');
  console.log('  cd android && ./gradlew assembleDebug');
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
