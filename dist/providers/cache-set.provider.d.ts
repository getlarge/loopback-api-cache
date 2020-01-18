/// <reference types="express" />
import { CacheStrategy, CacheSetFn } from '../types';
import { Provider, Getter } from '@loopback/core';
import { Request } from '@loopback/rest';
export declare class CacheSetProvider implements Provider<CacheSetFn> {
    readonly getCacheStrategy: Getter<CacheStrategy>;
    constructor(getCacheStrategy: Getter<CacheStrategy>);
    value(): CacheSetFn;
    action(request: Request, result: any): Promise<void>;
}
