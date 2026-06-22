# Dendric Estate Webflow OrderPort Scripts

Public source repo for the Webflow + OrderPort scripts used on Dendric Estate.

## Files

- `scripts/dendric-shop-op.js` - Shop page filters, variants, quantity controls, add to cart, and nav OrderPort bridge.
- `scripts/dendric-product-op.js` - Product template variants, quantity controls, add to cart, and nav OrderPort bridge.
- `scripts/dendric-nav-op.js` - Global nav OrderPort bridge for login and cart links on pages without shop/product commerce controls.

## Webflow Usage

This repo is public so Webflow can load the scripts through jsDelivr.

Site-wide footer:

```html
<script
  defer
  src="https://cdn.jsdelivr.net/gh/blackpixelca/dendric-webflow-orderport-scripts@6667a52cbbe892de4e75ed27503431832e50c084/scripts/dendric-nav-op.js"
  integrity="sha384-LuGEIaRvLn7wZNuSZLCcOvZVhOuT9Tkxo/RpYh+Jxnz5jonvlokCohIqjtdw/XyB"
  crossorigin="anonymous"></script>
```

Shop page footer:

```html
<script defer src="https://cdn.jsdelivr.net/gh/blackpixelca/dendric-webflow-orderport-scripts@e53ebc5a783a8677a21f3c28207508bc116ea180/scripts/dendric-shop-op.js"></script>
```

Product template footer:

```html
<script defer src="https://cdn.jsdelivr.net/gh/blackpixelca/dendric-webflow-orderport-scripts@e53ebc5a783a8677a21f3c28207508bc116ea180/scripts/dendric-product-op.js"></script>
```

## Notes

- OrderPort startup is loaded by each script only if it is not already present.
- Native OrderPort controls are kept visually hidden; Webflow-built UI controls remain the visible interface.
- Add to cart uses OrderPort's native cart facade first so the embedded side cart state updates immediately.
- Product availability and SKUs are configured in each script's `productMap`.
