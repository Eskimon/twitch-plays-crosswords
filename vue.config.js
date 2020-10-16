module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '.' : '/',
  // UglyTrick: Output to "docs/" instead of "dist/" to easily serve the project from github pages
  outputDir: 'docs',
}
