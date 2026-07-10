import {
  __commonJS
} from "./chunk-ZSMWDLMK.js";

// browser-external:node:path
var require_node_path = __commonJS({
  "browser-external:node:path"(exports, module) {
    module.exports = Object.create(new Proxy({}, {
      get(_, key) {
        if (key !== "__esModule" && key !== "__proto__" && key !== "constructor" && key !== "splice") {
          console.warn(`Module "node:path" has been externalized for browser compatibility. Cannot access "node:path.${key}" in client code. See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`);
        }
      }
    }));
  }
});

export {
  require_node_path
};
//# sourceMappingURL=chunk-AW2EMQN5.js.map
