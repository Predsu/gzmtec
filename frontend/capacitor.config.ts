import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.toriyukari.gzmtec',
  appName: 'GZMTEC',
  webDir: 'dist/frontend/browser',
  server: {
    androidScheme: "http"
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
