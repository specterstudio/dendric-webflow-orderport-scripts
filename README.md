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
  src="https://cdn.jsdelivr.net/gh/blackpixelca/dendric-webflow-orderport-scripts@8b9679dd7b7b020dfee92728bc508c5c5b2b15cd/scripts/dendric-nav-op.js"
  integrity="sha384-0dgf63ksUVgqDgfex0xAK6lx84YQj3Rb5Jy9ItrPZzVBl5h4gdtGoz0/Rs4BiQCq"
  crossorigin="anonymous"></script>
```

Shop page footer:

```html
<script
  defer
  src="https://cdn.jsdelivr.net/gh/blackpixelca/dendric-webflow-orderport-scripts@8b9679dd7b7b020dfee92728bc508c5c5b2b15cd/scripts/dendric-shop-op.js"
  integrity="sha384-qAoEu0O5b+Cu4/vFOMetT0tB9g62Uxmo3VM9ElPs4AJ6jowN3jzaw8rm1BM4KRt2"
  crossorigin="anonymous"></script>
```

Product template footer:

```html
<script
  defer
  src="https://cdn.jsdelivr.net/gh/blackpixelca/dendric-webflow-orderport-scripts@8b9679dd7b7b020dfee92728bc508c5c5b2b15cd/scripts/dendric-product-op.js"
  integrity="sha384-JrewFE8m/LbFiNdMADzxtCXVit7L9GSmGZFnE2FF44c3Fj1B/ze1x70DrNHNWlSt"
  crossorigin="anonymous"></script>
```

## Notes

- OrderPort startup is loaded by each script only if it is not already present.
- Native OrderPort controls are kept visually hidden; Webflow-built UI controls remain the visible interface.
- Add to cart uses OrderPort's native cart facade first so the embedded side cart state updates immediately.
- Product availability and SKUs are configured in each script's `productMap`.
