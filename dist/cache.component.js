"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const keys_1 = require("./keys");
const providers_1 = require("./providers");
class CacheComponent {
    // TODO(bajtos) inject configuration
    constructor() {
        this.providers = {
            [keys_1.CacheBindings.CACHE_CHECK_ACTION.key]: providers_1.CacheCheckProvider,
            [keys_1.CacheBindings.CACHE_SET_ACTION.key]: providers_1.CacheSetProvider,
            [keys_1.CacheBindings.METADATA.key]: providers_1.CacheMetadataProvider,
        };
    }
}
exports.CacheComponent = CacheComponent;
//# sourceMappingURL=cache.component.js.map