"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@loopback/core");
var CacheBindings;
(function (CacheBindings) {
    CacheBindings.CACHE_STRATEGY = core_1.BindingKey.create('cache.strategy');
    CacheBindings.CACHE_CHECK_ACTION = core_1.BindingKey.create('cache.check');
    CacheBindings.CACHE_SET_ACTION = core_1.BindingKey.create('cache.set');
    CacheBindings.METADATA = core_1.BindingKey.create('check.operationMetadata');
})(CacheBindings = exports.CacheBindings || (exports.CacheBindings = {}));
exports.CACHE_METADATA_KEY = core_1.MetadataAccessor.create('cache.operationsData');
//# sourceMappingURL=keys.js.map