module.exports = {
    plugins: ['commitlint-plugin-jira-rules'],
    extends: ['jira'],
    rules: {
      'references-empty': [2, 'never']
    },
    parserPreset: {
      parserOpts: {
        referenceActions: null, // https://github.com/conventional-changelog/commitlint/issues/372#issuecomment-418519784
        issuePrefixes: ['CRUZ-', 'SP-']
      }
    },
    ignores: [
        (message) => message.includes('npm build') // ignore a commit with `npm build`
    ]
  };