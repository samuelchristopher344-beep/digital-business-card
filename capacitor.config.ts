import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.christoflightx.callingcard',
  appName: 'Calling Card',
  webDir: '.output/public',
  server: {
    androidScheme: 'https',
    // IMPORTANT: digital-business-card.vercel.app is a DIFFERENT site (Jose Luis Bravo).
    // This project's real production URL is below.
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
};

export default config;
