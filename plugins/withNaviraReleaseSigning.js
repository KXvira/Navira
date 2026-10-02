const { withAppBuildGradle } = require('@expo/config-plugins');

const marker = '// NAVIRA_RELEASE_SIGNING';

module.exports = function withNaviraReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      throw new Error('Navira release signing requires Groovy app/build.gradle');
    }
    let contents = config.modResults.contents;
    if (contents.includes(marker)) return config;

    const signingAnchor = '    signingConfigs {\n';
    const buildTypesAnchor = '    buildTypes {\n';
    const signingIndex = contents.indexOf(signingAnchor);
    const buildTypesIndex = contents.indexOf(buildTypesAnchor, signingIndex);
    if (signingIndex < 0 || buildTypesIndex < 0) {
      throw new Error('Could not find Expo Android signing blocks');
    }

    const releaseSigning = `        ${marker}
        naviraRelease {
            def required = ['NAVIRA_KEYSTORE_PATH', 'NAVIRA_KEYSTORE_PASSWORD', 'NAVIRA_KEY_ALIAS', 'NAVIRA_KEY_PASSWORD']
            def releaseRequested = gradle.startParameter.taskNames.any { it.toLowerCase().contains('release') }
            if (releaseRequested) {
                required.each { name ->
                    if (!System.getenv(name)) throw new GradleException("Missing required signing variable: " + name)
                }
            }
            storeFile file(System.getenv('NAVIRA_KEYSTORE_PATH') ?: 'missing-release-keystore')
            storePassword System.getenv('NAVIRA_KEYSTORE_PASSWORD') ?: ''
            keyAlias System.getenv('NAVIRA_KEY_ALIAS') ?: ''
            keyPassword System.getenv('NAVIRA_KEY_PASSWORD') ?: ''
        }
`;
    contents = contents.replace(signingAnchor, signingAnchor + releaseSigning);

    const buildTypesStart = contents.indexOf(buildTypesAnchor);
    const releaseStart = contents.indexOf('        release {', buildTypesStart);
    const debugSigning = '            signingConfig signingConfigs.debug';
    const releaseSigningIndex = contents.indexOf(debugSigning, releaseStart);
    if (releaseStart < 0 || releaseSigningIndex < 0) {
      throw new Error('Could not find Expo Android release signing assignment');
    }
    contents =
      contents.slice(0, releaseSigningIndex) +
      '            signingConfig signingConfigs.naviraRelease' +
      contents.slice(releaseSigningIndex + debugSigning.length);
    config.modResults.contents = contents;
    return config;
  });
};
