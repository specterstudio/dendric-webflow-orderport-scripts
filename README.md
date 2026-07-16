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
  src="https://cdn.jsdelivr.net/gh/blackpixelca/dendric-webflow-orderport-scripts@ec6d1992bb4738e287efa7f38c3d8b27ce100f1d/scripts/dendric-nav-op.js"
  integrity="sha384-nht68GhBJp0ZVgQNg7URarctDtkSVQGWVOgoRTyqXPeLrzMzZRql+0ycXi2lrRta"
  crossorigin="anonymous"></script>
```

Shop page footer:

```html
<script
  defer
  src="https://cdn.jsdelivr.net/gh/blackpixelca/dendric-webflow-orderport-scripts@ec6d1992bb4738e287efa7f38c3d8b27ce100f1d/scripts/dendric-shop-op.js"
  integrity="sha384-+xRu7uKN3jA5CluT1Og0kgFWq+wpcwTPAgO0Vran6DR62Csk3/cOlbfHxpbyPYtf"
  crossorigin="anonymous"></script>
```

Product template footer:

```html
<script
  defer
  src="https://cdn.jsdelivr.net/gh/blackpixelca/dendric-webflow-orderport-scripts@ec6d1992bb4738e287efa7f38c3d8b27ce100f1d/scripts/dendric-product-op.js"
  integrity="sha384-Ma0zsMo/5Jwpr3D51/m2es53SRSOTLAWxOM6h+XEV2aaXPnZ0GDEEp/oXhsaYO0+"
  crossorigin="anonymous"></script>
```

## Notes

- OrderPort startup is loaded by each script only if it is not already present.
- Native OrderPort controls are kept visually hidden; Webflow-built UI controls remain the visible interface.
- Add to cart uses OrderPort's native cart facade first so the embedded side cart state updates immediately.
- Product availability and SKUs are configured in each script's `productMap`.
