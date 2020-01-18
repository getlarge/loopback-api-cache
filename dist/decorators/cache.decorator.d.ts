import { Constructor } from "@loopback/core";
export interface CacheMetadata {
    ttl: number;
    options?: Object;
}
export declare function cache(ttl?: number, options?: Object): MethodDecorator;
export declare function getCacheMetadata(controllerClass: Constructor<{}>, methodName: string): CacheMetadata | undefined;
