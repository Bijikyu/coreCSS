module.exports = {
  plugins: [
    require('autoprefixer'), //auto add vendor prefixes
    require('cssnano')({ preset: 'default' }) //minify css
  ]
};
