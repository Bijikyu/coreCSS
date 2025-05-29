<p align="center" >
  <img height='150' width='150' src="core.png?raw=true" />
</p>

# coreCSS

This is a ready to use default style sheet that contains default styles which look nice for most elements in html, allowing you to start any app with it not looking bald and terrible. 

Also includes...
* The features from [normalize CSS](https://github.com/necolas/normalize.css/) to make sure that your site will be more universally the same across browsers
* Class name based positioning attributes for [flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) (row, col, center, centerAlign, and so on) & width (col50, col80, etc, for 50% & 80% respectively), and [grid](https://css-tricks.com/snippets/css/complete-guide-grid/) (grid, grid3, etc upt to grid6)
* It also has some basic built in CSS animations
* Default media queries to make elements responsive to any screen size
* A variables.css style sheet template which allows you to stylistically change a whole page by just changing the values of the variables (for instance, the corners of a card, 
buttons, and other square elements have the corner radius set with the same variables - change the "roundedness" of all corners on your site with one variable change).
The imported core.css has it's css properties set off of these variables. This goes for many things in the theme, allowing 
the creation of multiple sites with different pallettes and styles to be a quick operation.
* Lastly the demo html page contains links to a minified free icon set which comes in a default color (LightSeaGreen). This icon set 
can be changed to fit any color/brightness/contrast scheme using the values in the CSS --set-adjustments variable.
A new `--obscure-filter` variable controls the filter used by the `.obscure` class and is disabled automatically when `prefers-reduced-motion: reduce` is detected. /* explains reduced filter variable */

This is used via the github based CDN https://www.jsdelivr.com

Import via CDN in the head of your html as:
```
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/Bijikyu/coreCSS/core.css">
```

Minified version:
```
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/Bijikyu/coreCSS/core.min.css">
```
`core.min.css` in this repo is generated from `core.css` by running `npm run build`, which processes the file with PostCSS and Autoprefixer.
Autoprefixer now targets only modern browsers using the browserslist of the last two versions of Chrome, Firefox, and Safari.

Copy variables.css into your local css stylesheet and change values as you like.


For best performance host icons and images on a CDN with long caching headers to avoid extra network requests.
Serve `core.min.css`, `icons.svg`, and all image assets with `Cache-Control: public, max-age=31536000` to let browsers cache them for a year.
Enable gzip or Brotli compression for `core.min.css` and `icons.svg` when serving them, using Nginx or CDN settings. /* instructs enabling asset compression */

For best performance host icons and images on a CDN with long caching headers to avoid extra network requests. Set `Cache-Control: public, max-age=31536000` when serving `core.min.css`, `icons.svg`, and image assets to leverage browser caching.
Enable gzip or Brotli compression on your server for these files.


<a href="https://www.buymeacoffee.com/bijikyu" target="_blank" rel="noopener noreferrer">Buy me a Coffee (Please)</a>
