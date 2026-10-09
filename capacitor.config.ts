import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.christoflightx.callingcard',
  appName: 'Calling Card',
  // TanStack Start + Nitro outputs static assets to .output/public (not dist)
  webDir: '.output/public',
  server: {
    androidScheme: 'https',
    // Uncomment to always load the live website inside the native shell
    // (useful if the static build is incomplete or you want instant updates):
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
