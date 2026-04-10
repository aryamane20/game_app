module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);
  const isTest = api.env('test');
  return {
    presets: [
      // In test env, disable reanimated auto-injection — it requires native build
      // tooling (react-native-worklets) that isn't available in Node/Jest.
      ['babel-preset-expo', { jsxImportSource: 'nativewind', reanimated: !isTest }],
      'nativewind/babel',
    ],
    plugins: isTest ? [] : ['react-native-reanimated/plugin'],
  };
};
