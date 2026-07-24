import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ayitialet.app',
  appName: 'Ayiti Alèt',
  webDir: 'dist',
  backgroundColor: '#0b1220',
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: '#0b1220',
      showSpinner: false,
    },
  },
  // Pandan devlopman, dekomante liy anba a pou teste sou yon aparèy fizik
  // konekte ak backend lokal ou a (ranplase ak IP lokal machin ou a):
  // server: { url: 'http://192.168.1.X:5173', cleartext: true },
};

export default config;
