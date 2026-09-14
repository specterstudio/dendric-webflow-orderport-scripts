const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class FakeElement {
  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
    this.children = [];
    this.dataset = {};
    this.style = {};
    this.textContent = "";
    this.listeners = {};
    this.nodeType = 1;
  }

  append(...children) {
    this.children.push(...children);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));

    if (name === "href") this.href = String(value);
    if (name === "draggable") this.draggable = String(value) === "true";

    if (name.startsWith("data-")) {
      const key = name
        .slice(5)
        .replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      this.dataset[key] = String(value);
    }
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }

  matches(selector) {
    if (selector === "a[href]") return this.tagName === "A" && Boolean(this.getAttribute("href"));
    if (selector === "img") return this.tagName === "IMG";
    return false;
  }

  closest(selector) {
    return this.matches(selector) ? this : null;
  }

  querySelector() {
    return null;
  }

  querySelectorAll(selector) {
    return this.children.filter((child) => child.matches?.(selector));
  }
}

class FakeDocument {
  constructor() {
    this.readyState = "complete";
    this.body = new FakeElement("body");
    this.head = new FakeElement("head");
    this.documentElement = new FakeElement("html");
  }

  addEventListener() {}

  createElement(tagName) {
    return new FakeElement(tagName);
  }

  querySelector() {
    return null;
  }

  querySelectorAll() {
    return [];
  }
}

const runScript = (filename) => {
  const document = new FakeDocument();
  const assignedUrls = [];
  const context = {
    URL,
    console,
    document,
    window: {
      clearTimeout() {},
      customElements: { whenDefined: () => Promise.resolve() },
      document,
      location: {
        assign: (url) => assignedUrls.push(url),
      },
      MutationObserver: class {
        observe() {}
        disconnect() {}
      },
      requestAnimationFrame: (callback) => callback(),
      setTimeout: () => 0,
    },
  };

  context.customElements = context.window.customElements;
  context.MutationObserver = context.window.MutationObserver;
  context.requestAnimationFrame = context.window.requestAnimationFrame;
  context.setTimeout = context.window.setTimeout;
  context.clearTimeout = context.window.clearTimeout;

  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "scripts", filename), "utf8"), context);

  return { assignedUrls, context };
};

["dendric-nav-op.js", "dendric-shop-op.js", "dendric-product-op.js"].forEach((filename) => {
  test(`${filename} rewrites checkout handoff to review cart`, () => {
    const { context } = runScript(filename);
    const helper = context.window.__dendricOpCartHandoff;

    assert.equal(
      helper.getReviewCartUrl("https://dendricestate.orderport.net/cart/checkout?altsid=abc123&next=auth"),
      "https://dendricestate.orderport.net/cart?altsid=abc123&next=auth",
    );
    assert.equal(helper.getReviewCartUrl("https://example.com/cart/checkout?altsid=abc123"), "");
  });

  test(`${filename} patches checkout anchors without exposing the session`, () => {
    const { assignedUrls, context } = runScript(filename);
    const anchor = new FakeElement("a");
    anchor.textContent = "Proceed to Checkout";
    anchor.setAttribute("href", "https://dendricestate.orderport.net/cart/checkout?altsid=secret-session");

    context.window.__dendricOpCartHandoff.scan(anchor);

    assert.equal(anchor.href, "https://dendricestate.orderport.net/cart?altsid=secret-session");
    assert.equal(anchor.textContent, "Review Cart & Checkout");
    assert.equal(anchor.dataset.dendricOpCheckoutHandoff, "true");

    let defaultPrevented = false;
    anchor.listeners.click({
      preventDefault: () => {
        defaultPrevented = true;
      },
    });

    assert.equal(defaultPrevented, true);
    assert.deepEqual(assignedUrls, ["https://dendricestate.orderport.net/cart?altsid=secret-session"]);
  });

  test(`${filename} disables native image dragging`, () => {
    const { context } = runScript(filename);
    const image = new FakeElement("img");

    context.window.__dendricImageDragPrevention.scan(image);

    assert.equal(image.draggable, false);
    assert.equal(image.getAttribute("draggable"), "false");
    assert.equal(image.style.webkitUserDrag, "none");
  });
});

test("shop catalog resolves unlinked CMS cards by their configured product names", () => {
  const { context } = runScript("dendric-shop-op.js");
  const catalog = context.window.__dendricShopCatalog;

  assert.equal(catalog.getProductSlugByName("Dry Cut"), "dry-cut");
  assert.equal(catalog.getProductSlugByName("Cider - 02/03"), "cider---02-03");
  assert.equal(catalog.getProductType("cider---03-03"), "Ciders");
});

test("shop size metadata includes only purchasable variants", () => {
  const { context } = runScript("dendric-shop-op.js");
  const catalog = context.window.__dendricShopCatalog;

  assert.deepEqual(Array.from(catalog.getAvailableSizes("dry-cut")), ["375 ML", "750 ML"]);
  assert.deepEqual(Array.from(catalog.getAvailableSizes("cider---02-03")), []);
  assert.deepEqual(Array.from(catalog.getAvailableSizes("cider---03-03")), []);
});

test("shop price range recognizes Webflow slider limits", () => {
  const { context } = runScript("dendric-shop-op.js");
  const catalog = context.window.__dendricShopCatalog;

  assert.equal(catalog.isPriceRangeActive("9", "80", "9", "80"), false);
  assert.equal(catalog.isPriceRangeActive("30", "80", "9", "80"), true);
  assert.equal(catalog.isPriceRangeActive("9", "15", "9", "80"), true);
});
