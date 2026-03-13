// metro.config.js
// Required for @supabase/supabase-js to work in React Native
// Supabase uses Node.js APIs (ws, url, stream, etc.) that need polyfills

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = false;

module.exports = config;
