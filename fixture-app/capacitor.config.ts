import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fixture.reyes',
  appName: 'fixture-app',
  webDir: 'dist/fixture-app/browser',
  server: {
    url: 'http://192.168.0.18:4200',
    cleartext: true
  }
};

export default config;
