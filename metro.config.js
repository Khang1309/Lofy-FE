const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
config.watchFolders = [];
config.server = {
    enhanceMiddleware: (middleware) => middleware,
};
module.exports = withNativeWind(config, { input: './global.css' });