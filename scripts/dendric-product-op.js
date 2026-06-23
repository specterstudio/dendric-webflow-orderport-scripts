(() => {
  const SELECTED_CLASS = "is-selected";

  const productMap = {
    "dry-cut": {
      "375 ML": { sku: "88884729-0002", available: true },
      "750 ML": { sku: "88884729-0001", available: true },
      "1.5 L": { sku: "DC1.5", available: false, label: "Coming Soon" },
    },
    "cider---02-03": {
      "375 ML": { sku: "OT375", available: false, label: "Coming Soon" },
      "750 ML": { sku: "OT750", available: false, label: "Coming Soon" },
      "1.5 L": { sku: "OT1.5", available: false, label: "Coming Soon" },
    },
    "cider---03-03": {
      "375 ML": { sku: "", available: false, label: "Coming Soon" },
      "750 ML": { sku: "", available: false, label: "Coming Soon" },
      "1.5 L": { sku: "", available: false, label: "Coming Soon" },
    },
  };

  let orderPortReadyPromise;
  let orderPortApiSessionPromise;

  const ready = (fn) => {
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", fn, { once: true })
      : fn();
  };

  const queryAll = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const getText = (element) => (element?.textContent || "").replace(/\s+/g, " ").trim();

  const createElement = (tag, attrs = {}) => {
    const element = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  };

  const getSlug = () => {
    return (
      document.documentElement.dataset.wfItemSlug ||
      window.location.pathname.split("/").filter(Boolean).pop() ||
      ""
    );
  };

  const getProductConfig = () => productMap[getSlug()] || {};

  const hasAvailableVariant = () => {
    return Object.values(getProductConfig()).some((variant) => variant?.sku && variant.available);
  };

  const ensureOrderPortShell = () => {
    if (!document.querySelector("style[data-op-bootstrap-layer]")) {
      const bootstrap = document.createElement("style");
      bootstrap.setAttribute("data-op-bootstrap-layer", "true");
      bootstrap.textContent =
        '@import url("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css") layer(op-bootstrap);' +
        ".button_main_text a{color:inherit;text-decoration:inherit}";
      document.head.append(bootstrap);
    }

    if (!document.querySelector("style[data-dendric-op-styles]")) {
      const styles = document.createElement("style");
      styles.setAttribute("data-dendric-op-styles", "true");
      styles.textContent =
        "op-side-cart,op-side-cart-toggle,op-auth-status,op-add-to-cart{font-family:Silka Mono,monospace;color:var(--_theme---text,#140e0d)}" +
        "op-side-cart{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;z-index:2147483000!important;pointer-events:none!important;display:block!important}" +
        "op-side-cart .side-cart{position:fixed!important;top:0!important;right:0!important;bottom:0!important;left:auto!important;width:min(100vw,24rem)!important;max-width:24rem!important;height:100vh!important;min-height:100vh!important;margin:0!important;overflow:auto!important;pointer-events:auto!important}" +
        "op-side-cart .side-cart:not(.open){display:none!important}" +
        "op-side-cart-toggle[data-dendric-native],op-auth-status[data-dendric-native]{position:fixed!important;right:0;top:0;width:1px!important;height:1px!important;opacity:.01!important;overflow:hidden!important;pointer-events:none!important;z-index:-1!important}" +
        ".op-native-add{position:absolute!important;left:-9999rem!important;top:auto!important;width:1px!important;height:1px!important;opacity:.01!important;overflow:hidden!important;pointer-events:none!important}" +
        "[op-card-add].is-disabled{opacity:.65;cursor:not-allowed}" +
        "[op-card-add].is-disabled .clickable_btn{pointer-events:none}";
      document.head.append(styles);
    }

    if (!document.querySelector("op-side-cart")) {
      document.body.append(createElement("op-side-cart", { "btn-start-shopping-url": "/shop" }));
    }

    if (!document.querySelector("op-side-cart-toggle")) {
      document.body.append(createElement("op-side-cart-toggle", { "data-dendric-native": "true" }));
    } else {
      document.querySelector("op-side-cart-toggle")?.setAttribute("data-dendric-native", "true");
    }

    if (!document.querySelector("op-auth-status")) {
      document.body.append(createElement("op-auth-status", { "data-dendric-native": "true" }));
    } else {
      document.querySelector("op-auth-status")?.setAttribute("data-dendric-native", "true");
    }
  };

  const waitForOrderPortElements = () => {
    const tags = ["op-side-cart", "op-side-cart-toggle", "op-auth-status"];

    return Promise.all(tags.map((tag) => customElements.whenDefined(tag))).then(() => {
      return new Promise((resolve) => window.setTimeout(resolve, 300));
    });
  };

  const loadOrderPortStartup = () => {
    if (orderPortReadyPromise) return orderPortReadyPromise;

    orderPortReadyPromise = new Promise((resolve) => {
      const existing = document.querySelector("script[data-dendric-op-startup]");

      const finish = () => {
        waitForOrderPortElements().then(resolve).catch(resolve);
      };

      if (existing) {
        finish();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://dendricestate.orderport.net/web-components/startup.js?v=1.7";
      script.setAttribute("data-dendric-op-startup", "true");
      script.addEventListener("load", finish, { once: true });
      script.addEventListener("error", resolve, { once: true });
      document.body.append(script);
    });

    return orderPortReadyPromise;
  };

  const clickOrderPortCartToggle = () => {
    const toggle = document.querySelector("op-side-cart-toggle");
    if (!toggle) return;

    const root = toggle.shadowRoot || toggle;
    const target = root.querySelector(".shopping-cart-icon,button,a,[role='button'],svg") || toggle;

    target.click();
  };

  const isOrderPortCartOpen = () => {
    return !!document.querySelector("op-side-cart .side-cart.open");
  };

  const getOrderPortCartFacade = () => {
    const candidates = [
      document.querySelector("op-side-cart"),
      document.querySelector("op-side-cart-details"),
      document.querySelector("op-side-cart-toggle"),
    ];

    for (const element of candidates) {
      const facade = element?._ngElementStrategy?.componentRef?.instance?.cartStoreFacade;
      if (facade?.addCartItem && facade?.setSideCartIsOpen) return facade;
    }

    return null;
  };

  const openOrderPortCart = () => {
    const facade = getOrderPortCartFacade();

    if (facade?.setSideCartIsOpen) {
      facade.setSideCartIsOpen(true);
      return;
    }

    if (!isOrderPortCartOpen()) {
      clickOrderPortCartToggle();
      return;
    }

    clickOrderPortCartToggle();
    window.setTimeout(clickOrderPortCartToggle, 150);
  };

  const refreshAndOpenOrderPortCart = (facade = getOrderPortCartFacade()) => {
    [0, 250, 900, 1800].forEach((delay) => {
      window.setTimeout(() => {
        const activeFacade = facade || getOrderPortCartFacade();

        try {
          activeFacade?.fetchWebCart?.(true);
        } catch (error) {
          console.warn("OrderPort cart refresh failed.", error);
        }

        if (activeFacade?.setSideCartIsOpen) {
          activeFacade.setSideCartIsOpen(true);
        } else if (!isOrderPortCartOpen()) {
          clickOrderPortCartToggle();
        }
      }, delay);
    });
  };

  const getOrderPortApiSession = () => {
    if (orderPortApiSessionPromise) return orderPortApiSessionPromise;

    orderPortApiSessionPromise = fetch("https://dendricestate.orderport.net/wwwapps/api/app-init/webstore?wc=true", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error(`OrderPort app-init failed: ${response.status}`);
        return response.json();
      })
      .then((json) => {
        const data = json.data || json.Data;
        if (!data?.apiUrl || !data?.auth?.param) {
          throw new Error("OrderPort app-init did not return API auth data.");
        }

        return {
          apiUrl: data.apiUrl,
          altSid: data.session?.altSid || "",
          authorization: `${data.auth.scheme || "Bearer"} ${data.auth.param}`,
        };
      });

    return orderPortApiSessionPromise;
  };

  const postOrderPortCartItem = async (sku, qty) => {
    const session = await getOrderPortApiSession();
    const headers = {
      accept: "application/json, text/plain, */*",
      "api-version": "1.0.0.2",
      "app-type": "webstore",
      authorization: session.authorization,
      "content-type": "application/json",
    };

    if (session.altSid) headers["alt-sid"] = session.altSid;

    const response = await fetch(
      `${session.apiUrl}/webcart/00000000-0000-0000-0000-000000000000/items/${encodeURIComponent(sku)}`,
      {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ item: { opsku: sku, qty } }),
      },
    );

    const json = await response.json().catch(() => null);

    if (!response.ok || (json && (json.status || json.Status) !== "Success")) {
      throw new Error(`OrderPort add to cart failed for ${sku}.`);
    }

    return json?.data || json?.Data;
  };

  const addOrderPortCartItem = (sku, qty) => {
    const facade = getOrderPortCartFacade();

    if (!facade?.addCartItem || !facade?.webCartState$?.cartItemActionResultState$?.subscribe) {
      return postOrderPortCartItem(sku, qty).then((cart) => {
        refreshAndOpenOrderPortCart();
        return cart;
      });
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      let subscription;
      const timeout = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        subscription?.unsubscribe?.();
        reject(new Error(`OrderPort native add to cart timed out for ${sku}.`));
      }, 8000);

      const finish = (callback, value) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        subscription?.unsubscribe?.();
        callback(value);
      };

      subscription = facade.webCartState$.cartItemActionResultState$.subscribe((state) => {
        const callState = String(state?.callState || "").toUpperCase();
        const resultSku = state?.result?.opsku;

        if (callState === "LOADED" && (!resultSku || resultSku === sku)) {
          refreshAndOpenOrderPortCart(facade);
          finish(resolve, state.result);
        }

        if (callState === "ERROR") {
          finish(reject, new Error(`OrderPort native add to cart failed for ${sku}.`));
        }
      });

      try {
        facade.addCartItem({ opsku: sku, qty });
        refreshAndOpenOrderPortCart(facade);
      } catch (error) {
        finish(reject, error);
      }
    });
  };

  const setupNavOrderPort = () => {
    queryAll("[op-auth-welcome]").forEach((welcome) => {
      if (!getText(welcome)) welcome.textContent = "Welcome";
    });

    queryAll("[op-auth-login]").forEach((login) => {
      if (login.dataset.dendricOpLoginReady) return;
      login.dataset.dendricOpLoginReady = "true";

      login.addEventListener("click", (event) => {
        event.preventDefault();

        const auth = document.querySelector("op-auth-status");
        const root = auth?.shadowRoot || auth;
        const link = root?.querySelector("a[href]");

        link?.click();
      });
    });

    queryAll("[op-cart-open]").forEach((cart) => {
      if (cart.dataset.dendricOpCartReady) return;
      cart.dataset.dendricOpCartReady = "true";

      cart.addEventListener("click", (event) => {
        event.preventDefault();
        clickOrderPortCartToggle();
      });

      cart.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        clickOrderPortCartToggle();
      });
    });
  };

  const setupProductOrderPort = () => {
    const product = document.querySelector(".product_main_wrap, .product_main_content, main");
    if (!product || product.dataset.dendricProductOpReady) return;

    product.dataset.dendricProductOpReady = "true";

    const formatPrice = (value) => {
      const price = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
      if (Number.isNaN(price)) return "";
      return `$${price.toFixed(price % 1 ? 2 : 0)}`;
    };

    const getVariantPrice = (option) => {
      const item = option.closest(".product_variants_item");
      return getText(item?.querySelector("[variant-source='product-price'],[variant-price]"));
    };

    const setButtonText = (text) => {
      const buttonWrap = product.querySelector("[op-card-add], .products_main_addtocart, .product_main_addtocart");
      const textElement = buttonWrap?.querySelector(".button_main_text");
      const clickable = buttonWrap?.querySelector(".clickable_btn,button,a");

      if (textElement) textElement.textContent = text;
      if (clickable) clickable.setAttribute("aria-label", text);
    };

    const getQtyParts = () => {
      const qtyWrap = product.querySelector("[op-card-qty], .products_main_quantity, .product_main_quantity");
      return {
        qtyWrap,
        value: product.querySelector("[op-card-qty-value]") || qtyWrap?.querySelector(".products_quantity_wrap > div"),
      };
    };

    const getQty = () => {
      const { value } = getQtyParts();
      const qty = parseInt(getText(value), 10);
      return Number.isNaN(qty) || qty < 1 ? 1 : qty;
    };

    const setQty = (nextQty) => {
      const { value } = getQtyParts();
      const qty = Math.max(1, Math.min(99, parseInt(nextQty, 10) || 1));
      if (value) value.textContent = qty;
      return qty;
    };

    const getSelectedOption = () => {
      return (
        product.querySelector(`[variant-select].${SELECTED_CLASS}`) ||
        product.querySelector("[variant-select].is-active") ||
        product.querySelector("[variant-select]")
      );
    };

    const getSelectedSize = () => getText(getSelectedOption());

    const getSelection = () => {
      const mapped = getProductConfig()[getSelectedSize()];
      const available = Boolean(mapped?.sku && mapped?.available);

      return {
        sku: mapped?.sku || "",
        available,
        label: available ? "Add to Cart" : mapped?.label || "Coming Soon",
      };
    };

    const setUnavailableProductState = () => {
      product.querySelector("[variant-lowest]")?.style.setProperty("display", "none");
      product.querySelector("[op-card-qty], .products_main_quantity, .product_main_quantity")?.style.setProperty("display", "none");

      const addWrap = product.querySelector("[op-card-add], .products_main_addtocart, .product_main_addtocart");
      addWrap?.classList.add("is-disabled");
      addWrap?.setAttribute("aria-disabled", "true");
      setButtonText("Coming Soon");
    };

    const syncProduct = () => {
      if (!hasAvailableVariant()) {
        setUnavailableProductState();
        return;
      }

      const selection = getSelection();
      const option = getSelectedOption();
      const priceElement = product.querySelector("[variant-lowest]");
      const addWrap = product.querySelector("[op-card-add], .products_main_addtocart, .product_main_addtocart");
      const clickable = addWrap?.querySelector(".clickable_btn,button,a");
      const { qtyWrap } = getQtyParts();

      setButtonText(selection.label);

      addWrap?.classList.toggle("is-disabled", !selection.available);
      addWrap?.setAttribute("aria-disabled", selection.available ? "false" : "true");
      qtyWrap?.style.setProperty("display", selection.available ? "" : "none");

      if (clickable) {
        clickable.disabled = !selection.available;
        clickable.setAttribute("aria-disabled", selection.available ? "false" : "true");
      }

      if (priceElement && option) {
        const selectedPrice = getVariantPrice(option);
        if (selectedPrice) priceElement.textContent = formatPrice(selectedPrice);
      }

      setQty(getQty());
    };

    const options = queryAll("[variant-select]", product);

    if (options.length && !options.some((option) => option.classList.contains(SELECTED_CLASS) || option.classList.contains("is-active"))) {
      options[0].classList.add(SELECTED_CLASS);
    }

    options.forEach((option) => {
      option.addEventListener("click", (event) => {
        event.preventDefault();
        options.forEach((item) => item.classList.remove(SELECTED_CLASS, "is-active"));
        option.classList.add(SELECTED_CLASS);
        syncProduct();
      });
    });

    product.addEventListener("click", (event) => {
      const minus = event.target.closest("[op-card-qty-minus]");
      const plus = event.target.closest("[op-card-qty-plus]");
      const add = event.target.closest("[op-card-add], .products_main_addtocart, .product_main_addtocart");

      if (minus && product.contains(minus)) {
        event.preventDefault();
        setQty(getQty() - 1);
        return;
      }

      if (plus && product.contains(plus)) {
        event.preventDefault();
        setQty(getQty() + 1);
        return;
      }

      if (!add || !product.contains(add)) return;

      event.preventDefault();

      const selection = getSelection();
      if (!selection.available || product.dataset.dendricAdding === "true") return;

      product.dataset.dendricAdding = "true";
      setButtonText("Adding...");

      addOrderPortCartItem(selection.sku, getQty())
        .then(() => {
          setButtonText("Added");
          window.setTimeout(openOrderPortCart, 100);
        })
        .catch((error) => {
          console.error(error);
          setButtonText("Add to Cart");
        })
        .finally(() => {
          window.setTimeout(() => {
            delete product.dataset.dendricAdding;
            setButtonText("Add to Cart");
          }, 1200);
        });
    });

    syncProduct();
  };

  ready(() => {
    ensureOrderPortShell();
    setupNavOrderPort();
    loadOrderPortStartup().then(() => {
      setupProductOrderPort();
      window.setTimeout(setupProductOrderPort, 900);
    });
  });
})();
