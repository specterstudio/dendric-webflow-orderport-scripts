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
  src="https://cdn.jsdelivr.net/gh/specterstudio/dendric-webflow-orderport-scripts@d0c00996a626ee4c60ca4abdacf37dfedb802bf9/scripts/dendric-nav-op.js"
  integrity="sha384-GpBGbXWakVgXmzrpQF+da7J0zJ6gYBULRzLTAOBeHhy0rPAW8jvgZy2OcneVRNkt"
  crossorigin="anonymous"></script>
```

Shop page footer:

```html
<script
  defer
  src="https://cdn.jsdelivr.net/gh/specterstudio/dendric-webflow-orderport-scripts@d0c00996a626ee4c60ca4abdacf37dfedb802bf9/scripts/dendric-shop-op.js"
  integrity="sha384-m4Pdby8Zp30Ddsi5JA7dEvdqIzzQW2ARMnUq23mIi7ARIkD63xjzLpMy/FogrQmF"
  crossorigin="anonymous"></script>
```

Product template footer:

```html
<script
  defer
  src="https://cdn.jsdelivr.net/gh/specterstudio/dendric-webflow-orderport-scripts@d0c00996a626ee4c60ca4abdacf37dfedb802bf9/scripts/dendric-product-op.js"
  integrity="sha384-BybNucAATqXQx97gs1Rz00E3K4568otFBJ9e3YclQ0h90OvQrYSDj5ko801a3HpM"
  crossorigin="anonymous"></script>
```

## Notes

- OrderPort startup is loaded by each script only if it is not already present.
- Native OrderPort controls are kept visually hidden; Webflow-built UI controls remain the visible interface.
- Add to cart uses OrderPort's native cart facade first so the embedded side cart state updates immediately.
- Product availability and SKUs are configured in each script's `productMap`.
