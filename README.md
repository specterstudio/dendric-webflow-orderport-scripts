# Dendric Estate Webflow OrderPort Scripts

Public source repo for the Webflow + OrderPort scripts used on Dendric Estate.

## Files

- `scripts/dendric-shop-op.js` - Shop page filters, variants, quantity controls, add to cart, and nav OrderPort bridge.
- `scripts/dendric-product-op.js` - Product template variants, quantity controls, add to cart, and nav OrderPort bridge.
- `scripts/dendric-product-gallery.js` - Product template GSAP gallery navigation and autoplay.
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
  src="https://cdn.jsdelivr.net/gh/specterstudio/dendric-webflow-orderport-scripts@809661f6bc57fb97fa2f90543ed6cc8151ced7c1/scripts/dendric-shop-op.js"
  integrity="sha384-A/5aCy/aCYPK8nUwvbfmURejkzzSJ9lLIHfmdmajid/9SUYQxNcbzQOba8Cd2gGS"
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

Product template gallery, after GSAP, CustomEase, and Observer:

```html
<script
  defer
  src="https://cdn.jsdelivr.net/gh/specterstudio/dendric-webflow-orderport-scripts@5b9303d5121bdb3a4047c4e73d9f78ff6ec17103/scripts/dendric-product-gallery.js"
  integrity="sha384-5MgKPKXt2/f2LYOJB4fMQxy+ngodIQpenN+zm1Z7SJlry8SifeaYC7KXcipqHiiU"
  crossorigin="anonymous"></script>
```

## Notes

- OrderPort startup is loaded by each script only if it is not already present.
- Native OrderPort controls are kept visually hidden; Webflow-built UI controls remain the visible interface.
- Add to cart uses OrderPort's native cart facade first so the embedded side cart state updates immediately.
- Product availability and SKUs are configured in each script's `productMap`.
- The Shop grid startup guard is included in `dendric-shop-op.js`; remove the former inline `__dendricShopGridGuard` script from the Shop page.
- Replace the Product Template's two inline slideshow scripts with the hosted gallery tag; do not load both implementations together.

## Phase 1 Repair Notes

Phase 1 is implemented only in this repository. It does not change Webflow, OrderPort-hosted scripts, OrderPort catalog data, checkout templates, `config.js`, `bundle.js`, or `startup.js`.

- Checkout handoff: the nav, shop, and product integrations now watch for OrderPort-rendered `/cart/checkout` links and rewrite them to `/cart` while preserving the existing query string, including `altsid`. The visible/accessible label becomes "Review Cart & Checkout". This is a tested client-side mitigation so OrderPort's full cart page becomes the first-party handoff before auth/checkout, but it still needs full guest-checkout verification in Phase 2.
- Cart integration: the existing native OrderPort cart facade path remains in place, and the direct REST fallback remains in place. Phase 1 does not expand dependence on undocumented Angular internals.
- Shop filters: product and price metadata are prepared before coalesced Finsweet list restarts. The grid guard no longer stops permanently after the first filter interaction; it only restores cached product cards when no filter is active, avoiding forced restoration for legitimate zero-result filters.
- Price filters: script-controlled price matching no longer expands the requested range beyond the visible min/max values.
- Image dragging: the global integration disables native image dragging for normal images, applies to dynamically inserted images, and leaves links, buttons, scrolling, and pointer behavior intact.

Local verification:

```sh
node --check scripts/dendric-nav-op.js
node --check scripts/dendric-shop-op.js
node --check scripts/dendric-product-op.js
node --test test/phase1-dom-tests.js
```

For browser-level pre-deploy verification, serve the repository locally and open `test/phase1-browser-fixture.html`. The fixture loads the actual shop script and prints JSON confirming checkout handoff, image drag prevention, price token matching, and grid-guard behavior.

## Phase 2 Webflow Update Checklist

Do not update these live pins until Phase 2. After the Phase 1 pull request is merged, replace `<MERGED_PHASE_1_COMMIT_SHA>` with the merged commit SHA that contains the Phase 1 script changes.

Site-wide footer:

```html
<script
  defer
  src="https://cdn.jsdelivr.net/gh/specterstudio/dendric-webflow-orderport-scripts@<MERGED_PHASE_1_COMMIT_SHA>/scripts/dendric-nav-op.js"
  integrity="sha384-YwlaXCNZaGu4Y3Tp0sTh7blglWleoe75XWJq6SoYIJd3E6Ho8ACENHAqRQMUNA+0"
  crossorigin="anonymous"></script>
```

Shop page footer:

```html
<script
  defer
  src="https://cdn.jsdelivr.net/gh/specterstudio/dendric-webflow-orderport-scripts@<MERGED_PHASE_1_COMMIT_SHA>/scripts/dendric-shop-op.js"
  integrity="sha384-/7eIl4ycr8MjKdr6gPd2e9UPMPC4VVvXSUVfh6IIagOak8zKeNpK/ShVfm+wbXFB"
  crossorigin="anonymous"></script>
```

Product template footer:

```html
<script
  defer
  src="https://cdn.jsdelivr.net/gh/specterstudio/dendric-webflow-orderport-scripts@<MERGED_PHASE_1_COMMIT_SHA>/scripts/dendric-product-op.js"
  integrity="sha384-6TlQxdyDwFLUwN/hJJZB+eNWUFVBVWl7M9r2V2Jn3NskBLtiggQumABd7DTWq9Vb"
  crossorigin="anonymous"></script>
```

The product gallery script is unchanged in Phase 1 and can keep its current pin unless Phase 2 changes it.

Phase 2 Webflow work still needed:

- Update Webflow's pinned jsDelivr script references and SRI hashes.
- Review and repair mobile filter layout/drawer behavior in Webflow.
- Ensure products appear before the filter interface on mobile.
- Add state-availability notices in the age gate and shop where Webflow controls the markup.
- Publish once, then run end-to-end mobile and desktop testing.
- Fully verify guest checkout after the `/cart` handoff.
- Add any checkout-page messaging that can only be changed in OrderPort.

## Phase 2 Shop Readiness Follow-up

The follow-up shop repair keeps invalid purchasing UI out of view while OrderPort loads:

- Product prices and Coming Soon states are initialized immediately from the repository configuration.
- Quantity and Add to Cart controls remain hidden until the OrderPort web components are ready.
- A failed OrderPort startup does not enable purchasing controls.
- CMS cards without product links resolve through the configured product name map, so product-type filtering does not require a separate inline Webflow patch.
- Size filter metadata contains only variants with an available OrderPort SKU. Current Coming Soon products are excluded from purchasable-size results.

The Shop page's Finsweet range slider should use `min="9"`, `max="80"`, `step="1"`, and handle starts of `9` and `80`. Finsweet v2 checks decimal steps using floating-point remainder, which produces console errors and shifts the `$9.95` lower bound even when the decimal values are mathematically aligned.

After this follow-up is merged, update only the Shop page's script pin and SRI hash to the new merge commit. Remove the temporary inline `applyProductTypes` patch because the hosted script now supplies product types for all configured cards. Save these Webflow changes without publishing until staging verification is explicitly authorized.
