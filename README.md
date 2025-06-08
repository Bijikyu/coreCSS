
<p align="center">
  <img height='150' width='150' src="qore.png?raw=true" />
</p>

# qoreCSS

A ready-to-use CSS framework that provides beautiful default styles and utility classes to quickly build modern web applications without starting from scratch.

## Features

- **Beautiful defaults** - Default styles that make HTML elements look great out of the box
- **Normalize.css included** - Cross-browser consistency built-in
- **Flexbox & Grid utilities** - Classes for layout positioning (`row`, `col`, `center`, `grid3`, etc.)
- **Responsive design** - Built-in media queries for all screen sizes
- **CSS animations** - Smooth, modern animations included
- **Customizable variables** - Easy theming through CSS custom properties
- **Icon support** - Color-adjustable icon system with filters
- **Glass morphism** - Modern `.obscure` class with backdrop blur effects

## Quick Start

### CDN (Recommended)
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Bijikyu/qoreCSS/core.min.css">
```

### NPM
```bash
npm install qoreCSS
```

Then import in your project:
```javascript
require('qoreCSS');
// or
import 'qoreCSS';
```

## Customization

Copy `variables.css` to your project and modify the CSS custom properties to match your design:

```css
:root {
    --color-dominant: #8b4c42;  /* Primary brand color */
    --color-two: #a0614a;       /* Secondary color */
    --color-bright: #b97a6e;    /* Accent color */
    --gs-lightest: #f5f3f3;     /* Light backgrounds */
    --gs-darkest: #2d1b13;      /* Dark backgrounds */
}
```

## Key Classes

### Layout
- `.row`, `.col` - Flexbox containers
- `.center`, `.centerAlign` - Centering utilities
- `.superCenter` - Perfect centering for main content
- `.grid`, `.grid3`, `.grid4` - CSS Grid layouts
- `.col50`, `.col80` - Percentage widths

### Styling
- `.card`, `.cardWhite` - Card components
- `.bright`, `.dark`, `.lightest` - Background colors
- `.textCenter`, `.textLeft` - Text alignment
- `.padding20`, `.margin30` - Spacing utilities
- `.obscure` - Glass morphism effect

### Icons
- `.icon` - Applies theme color adjustments
- `.iconLarge` - Large icon sizing
- `.sq15`, `.sq25` - Square icon sizes

## Development

```bash
# Install dependencies
npm install

# Build minified version
npm run build

# Run tests
npm test

# Lint styles
npm run lint
```

## Performance

The framework is optimized for performance:
- Minified version is automatically generated with content hashing
- CDN delivery through jsDelivr with global edge caching
- Gzip/Brotli compression supported
- Cache headers optimized for long-term caching

## Browser Support

Supports all modern browsers with the following baseline:
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with equivalent versions

## Contributing

1. Fork the repository
2. Create your feature branch
3. Run tests with `npm test`
4. Submit a pull request

## Deployment

The project automatically builds and deploys to GitHub Pages on every push to `main`. The CDN is updated automatically through jsDelivr.

For self-hosting, see [docs/self-hosting.md](docs/self-hosting.md) for optimal server configuration.

## License

This project is licensed under the [MIT License](LICENSE).

## Support

<a href="https://www.buymeacoffee.com/bijikyu" target="_blank" rel="noopener noreferrer">Buy me a Coffee</a>

---

*Built with ❤️ for developers who want beautiful web apps without the complexity*
