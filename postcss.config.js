// PostCSS configuration for building the production stylesheet
module.exports = {
  plugins: [
    require('autoprefixer'), // automatically add vendor prefixes for cross-browser support
    require('cssnano')({ preset: 'default' }) // minify css for smaller production bundle
  ]
};
