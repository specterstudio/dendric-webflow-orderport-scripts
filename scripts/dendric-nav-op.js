(() => {
  let orderPortReadyPromise;

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

  const ensureOrderPortShell = () => {
    if (!document.querySelector("style[data-op-bootstrap-layer]")) {
      const bootstrap = document.createElement("style");
      bootstrap.setAttribute("data-op-bootstrap-layer", "true");
      bootstrap.textContent =
        '@import url("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css") layer(op-bootstrap);' +
        ":root{--bs-body-font-family:var(--_typography---font--mono-family,\"Silka Mono\",monospace)}" +
        "body{font-family:var(--_typography---font--mono-family,\"Silka Mono\",monospace)!important}" +
        ".button_main_text a{color:inherit;text-decoration:inherit}";
      document.head.append(bootstrap);
    }

    if (!document.querySelector("style[data-dendric-op-styles]")) {
      const styles = document.createElement("style");
      styles.setAttribute("data-dendric-op-styles", "true");
      styles.textContent =
        "op-side-cart,op-side-cart-toggle,op-auth-status{font-family:Silka Mono,monospace;color:var(--_theme---text,#140e0d)}" +
        "op-side-cart{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;z-index:2147483000!important;pointer-events:none!important;display:block!important}" +
        "op-side-cart .side-cart{position:fixed!important;top:0!important;right:0!important;bottom:0!important;left:auto!important;width:min(100vw,24rem)!important;max-width:24rem!important;height:100vh!important;min-height:100vh!important;margin:0!important;overflow:auto!important;pointer-events:auto!important}" +
        "op-side-cart .side-cart:not(.open){display:none!important}" +
        "op-side-cart-toggle[data-dendric-native],op-auth-status[data-dendric-native]{position:fixed!important;right:0;top:0;width:1px!important;height:1px!important;opacity:.01!important;overflow:hidden!important;pointer-events:none!important;z-index:-1!important}";
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

  const clickOrderPortAuthLink = () => {
    const auth = document.querySelector("op-auth-status");
    const root = auth?.shadowRoot || auth;
    const link = root?.querySelector("a[href]");

    if (link) {
      link.click();
      return;
    }

    window.location.href = "https://dendricestate.orderport.net/auth";
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
        loadOrderPortStartup().then(clickOrderPortAuthLink);
      });
    });

    queryAll("[op-cart-open]").forEach((cart) => {
      if (cart.dataset.dendricOpCartReady) return;
      cart.dataset.dendricOpCartReady = "true";

      cart.addEventListener("click", (event) => {
        event.preventDefault();
        loadOrderPortStartup().then(clickOrderPortCartToggle);
      });

      cart.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        loadOrderPortStartup().then(clickOrderPortCartToggle);
      });
    });
  };

  ready(() => {
    ensureOrderPortShell();
    setupNavOrderPort();
    loadOrderPortStartup().then(setupNavOrderPort);
  });
})();
