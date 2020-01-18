"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@loopback/core");
const keys_1 = require("../keys");
function cache(ttl = 60, options) {
    return core_1.MethodDecoratorFactory.createDecorator(keys_1.CACHE_METADATA_KEY, {
        ttl,
        options: options || {}
    });
}
exports.cache = cache;
function getCacheMetadata(controllerClass, methodName) {
    return core_1.MetadataInspector.getMethodMetadata(keys_1.CACHE_METADATA_KEY, controllerClass.prototype, methodName);
}
exports.getCacheMetadata = getCacheMetadata;
//# sourceMappingURL=cache.decorator.js.map