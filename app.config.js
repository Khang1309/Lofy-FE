import 'dotenv/config';
import {
  writeFileSync, existsSync
} from 'fs';

// 1. DYNAMICALLY CREATE THE FILE
// If the file is missing locally (because you ignored it) 
// AND the environment variable exists (on EAS server), create the file.
if (!existsSync('./google-services.json') && process.env.GOOGLE_SERVICES_JSON) {
  writeFileSync('./google-services.json', process.env.GOOGLE_SERVICES_JSON);
}
// 2. EXPORT THE CONFIG
export default {
  expo: {
    name: "Lofy",
    slug: "Lofy",
    version: "1.1.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourname.lofy"
    },
    android: {
      package: "com.yourname.lofy",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff"
      },
      // 3. POINT TO THE FILE (It exists now because we created it above)
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "11ea8666-552a-4edf-9474-01bb9a4498fb",
        apiUrl: process.env.EXPO_PUBLIC_API_URL
      }
    },
    updates: {
      enabled: false
    },
    plugins: [
      "expo-router",
      "@sentry/react-native"
    ]
  }
};