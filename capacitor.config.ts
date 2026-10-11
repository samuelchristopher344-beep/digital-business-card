import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.christoflightx.callingcard',
  appName: 'Calling Card',
  webDir: '.output/public',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Live production site loaded inside the native shell
    url: 'https://digital-business-card-samuelchristopher344-beep.vercel.app',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
  android: {
    allowMixedContent: true,
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
};

export default config;
