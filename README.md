<p align="center" >
  <img height='150' width='150' src="https://github.com/Bijikyu/staticAssetsSmall/blob/main/logos/core-logo-min.png?raw=true" />
</p>
<p align="center" >
<caption>This logo vies with Flask for terribleness, <br> & was made by an AI in 5 minutes. </caption>
</p>

# coreCSS

This is a ready to use default style sheet that contains default styles which look nice for most elements in html. 

Also includes...
* The features from normalize CSS to make sure that your site will be more universally the same across browsers
* Class based positioning attributes for flexbox (row, col, center, centerAlign, and so on) & width (col50, col80, etc, for 50% & 80% respectively)
* It also has some basic built in CSS animations
* Default media queries to make elements responsive to any screen size
* A variables.css style sheet template which allows you to stylistically change a whole page by just changing the values of the variables (for instance, the corners of a card, 
buttons, and other square elements have the corner radius set with the same variables - change the "roundedness" of all corners on your site with one variable change).
The imported core.css has it's css properties set off of these variables. This goes for many things in the theme, allowing 
the creation of multiple sites with different pallettes and styles to be a quick operation.
* Lastly the demo html page contains links to an icon set which comes in a default color. This icon set 
can be changed to fit any color/brightness/contrast scheme using the values in the CSS --set-adjustments variable.

This is used via the github based CDN https://www.jsdelivr.com

Import via CDN in the head of your html as:
```
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/Bijikyu/coreCSS/core.css)">
```

Minified version:
```
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/Bijikyu/coreCSS/core.min.css">
```

Copy variables.css into your local css stylesheet and change values as you like.

<a href="https://www.buymeacoffee.com/bijikyu" target="_blank" rel="noopener noreferrer">Buy me a Coffee (Please)</a>
