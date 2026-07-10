import {
  __commonJS
} from "./chunk-ZSMWDLMK.js";

// browser-external:node:url
var require_node_url = __commonJS({
  "browser-external:node:url"(exports, module) {
    module.exports = Object.create(new Proxy({}, {
      get(_, key) {
        if (key !== "__esModule" && key !== "__proto__" && key !== "constructor" && key !== "splice") {
          console.warn(`Module "node:url" has been externalized for browser compatibility. Cannot access "node:url.${key}" in client code. See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`);
        }
      }
    }));
  }
});

// browser-external:node:module
var require_node_module = __commonJS({
  "browser-external:node:module"(exports, module) {
    module.exports = Object.create(new Proxy({}, {
      get(_, key) {
        if (key !== "__esModule" && key !== "__proto__" && key !== "constructor" && key !== "splice") {
          console.warn(`Module "node:module" has been externalized for browser compatibility. Cannot access "node:module.${key}" in client code. See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`);
        }
      }
    }));
  }
});

export {
  require_node_url,
  require_node_module
};
//# sourceMappingURL=chunk-EF6WBC6R.js.map
