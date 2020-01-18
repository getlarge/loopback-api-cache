/// <reference types="express" />
import { Cache, CacheStrategy, CacheCheckFn } from '../types';
import { Provider, Getter } from '@loopback/core';
import { Request } from '@loopback/rest';
export declare class CacheCheckProvider implements Provider<CacheCheckFn> {
    readonly getCacheStrategy: Getter<CacheStrategy>;
    constructor(getCacheStrategy: Getter<CacheStrategy>);
    value(): CacheCheckFn;
    action(request: Request): Promise<Cache | undefined>;
}
