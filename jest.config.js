module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
  ],
  moduleNameMapper: {
    "^styles/(.*)$": "<rootDir>/styles/$1",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "store/**/*.{ts,tsx}",
    "services/**/*.{ts,tsx}",
    "!app/**/_layout.tsx",
    "!app/+html.tsx",
    "!**/node_modules/**"
  ],
  coverageReporters: [
    "lcov",  // Quan trọng cho SonarCloud
    "text",
    "html"   // Quan trọng cho GitHub Artifact
  ],
  coverageDirectory: "coverage",
  // Bỏ dòng setupFilesAfterEnv nếu bạn chưa cài @testing-library/jest-native để tránh lỗi
};