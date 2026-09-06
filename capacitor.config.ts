import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.gilaniai.app",
  appName: "GilaniAI",
  webDir: ".output/public",
  server: {
    url: "https://gilaniai.site",
    cleartext: true,
  },
  plugins: {
    SystemBars: {
      insetsHandling: "disable",
    },
  },
};

export default config;
