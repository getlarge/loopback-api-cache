import { CacheSetFn, CacheStrategy, CacheCheckFn } from './types';
import { BindingKey, MetadataAccessor } from '@loopback/core';
import { CacheMetadata } from './decorators/cache.decorator';
export declare namespace CacheBindings {
    const CACHE_STRATEGY: BindingKey<CacheStrategy | undefined>;
    const CACHE_CHECK_ACTION: BindingKey<CacheCheckFn | undefined>;
    const CACHE_SET_ACTION: BindingKey<CacheSetFn | undefined>;
    const METADATA: BindingKey<CacheMetadata | undefined>;
}
export declare const CACHE_METADATA_KEY: MetadataAccessor<CacheMetadata, MethodDecorator>;
