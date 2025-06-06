<p align="center" >
  <img height='150' width='150' src="core.png?raw=true" />
</p>

# qoreCSS

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
The `.obscure` class applies `backdrop-filter: blur(7px) brightness(200%)` to create a modern glass effect overlay. /* documents .obscure class */

This is used via the github based CDN https://www.jsdelivr.com

The HTML demo and performance script read the CDN base URL from the `CDN_BASE_URL` environment variable, defaulting to `https://cdn.jsdelivr.net` when unset. Set this variable if hosting the files on a different CDN. index.html contains the placeholder `{{CDN_BASE_URL}}` that `scripts/updateHtml.js` replaces during build.

Import via CDN in the head of your html as:
```
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/Bijikyu/qoreCSS/core.css">
```

Minified version:
```
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/Bijikyu/qoreCSS/core.min.css">
```
`core.min.css` in this repo is generated from `core.css` by running `npm run build`. This command executes `node scripts/build.js`, which processes the file with PostCSS and Autoprefixer and deletes any older `core.*.min.css` files so only the newest hash remains.

The `build` script in `package.json` looks like:
```
"scripts": {
  "build": "node scripts/build.js",
  "lint": "stylelint core.css variables.css"
}
```

The repository now uses a GitHub Actions workflow that builds `core.min.css` and deploys it to GitHub Pages on every push to `main`. <!-- //added explanation of automatic deployment -->
It also creates a semantic version tag when `main` is updated so consumers can target specific releases. <!-- //explains new auto tagging -->
This workflow allows jsDelivr to fetch the latest files from the `gh-pages` branch so the CDN stays up to date. <!-- //explains CDN delivery -->

Images like the logo can also be loaded from jsDelivr at
`https://cdn.jsdelivr.net/gh/Bijikyu/staticAssetsSmall/logos/core-logo-min.png`.
Use these CDN links instead of the raw GitHub URLs for faster delivery.

Copy variables.css into your local css stylesheet and change values as you like.



For best performance host icons and images on a CDN with long caching headers to avoid extra network requests. Serve `core.min.css` and image assets with `Cache-Control: public, max-age=31536000` and enable gzip or Brotli compression. See `deployment/nginx.conf` for a sample configuration. <!-- //added explanation about caching and new nginx snippet -->

## Customization <!-- //added section documenting icon filter behavior -->
`variables.css` includes theme variables such as `--set-adjustments` for recoloring icons. <!-- //clarifies icon recoloring behavior -->


## Server/CDN configuration


To maximize caching and compression when hosting the assets yourself or on a CDN:

* Set `Cache-Control: public, max-age=31536000` for `core.min.css`, `icons.svg`, and all image files so browsers store them for a year.
* Set `Cache-Control: no-cache` for HTML files like `index.html` so browsers always fetch updates. <!-- //explains short cache for html pages -->
* Enable gzip or Brotli compression for these same files.

Example Nginx snippet (also saved in `deployment/nginx.conf`):
```nginx
location ~* \.(?:css|png|jpe?g|svg|gif)$ { # caches and compresses assets
    gzip on; # enables gzip
    gzip_static on; # serves .gz when available
    gzip_types text/css image/svg+xml image/png image/jpeg image/gif; # gzip MIME types
    brotli on; # enables brotli
    brotli_static on; # serves .br when available
    brotli_types text/css image/svg+xml image/png image/jpeg image/gif; # brotli MIME types
    add_header Cache-Control "public, max-age=31536000"; # year long cache
}
```

Example CDN headers:
```text
Cache-Control: public, max-age=31536000
Content-Encoding: br
```

For self-hosting you should replicate these headers and compression settings as
shown in [docs/self-hosting.md](docs/self-hosting.md). Hashed filenames such as
`core.77526ae8.min.css` enable year-long caching because a new filename is
generated on each build. When updating the stylesheet purge any CDN caches so
clients fetch the new hash.

<!-- Installation Section -->
        <section class='card col90 margin30 pad30'>
            <h2 class="textCenter margin25">Quick Installation</h2>
            <div class="cardWhite pad25 margin20">
                <h4 class="textDark">CDN Link (Quick Start)</h4>
                <code class="textDark" style="background: #f5f5f5; padding: 10px; border-radius: 5px; display: block; margin: 10px 0;">
                    &lt;link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Bijikyu/qoreCSS/core.min.css"&gt;
                </code>

                <h4 class="textDark margin25">NPM Package</h4>
                <code class="textDark" style="background: #f5f5f5; padding: 10px; border-radius: 5px; display: block; margin: 10px 0;">
                    npm install qoreCSS
                </code>
                <p class="textDark" style="font-size: 14px; margin: 10px 0;">
                    Then import in your JavaScript: <code>require('qoreCSS')</code> or use with bundlers like Webpack/Rollup
                </p>
            </div>
        </section>


<a href="https://www.buymeacoffee.com/bijikyu" target="_blank" rel="noopener noreferrer">Buy me a Coffee (Please)</a>

## License
This project is licensed under the [MIT License](LICENSE).

## Performance testing
A script for measuring download times from jsDelivr and GitHub Pages is in [docs/performance.md](docs/performance.md). Use it to verify asset delivery speed under load. Pass `--json` to append results to `performance-results.json` for automation.