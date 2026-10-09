import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.christoflightx.callingcard',
  appName: 'Calling Card',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Uncomment the next line if you prefer the native app to always load the live website
    // (useful while the static build is still being refined):
    // url: 'https://digital-business-card.vercel.app',
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
