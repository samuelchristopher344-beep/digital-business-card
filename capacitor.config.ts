import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.christoflightx.callingcard',
  appName: 'Calling Card',
  // Still required by Capacitor CLI even when server.url is set
  webDir: '.output/public',
  server: {
    androidScheme: 'https',
    // Load the live website inside the native shell.
    // Benefits: full app works, and any Vercel deploy updates the phone app automatically
    // (no need to reinstall the APK for content/UI changes).
    url: 'https://digital-business-card.vercel.app',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
