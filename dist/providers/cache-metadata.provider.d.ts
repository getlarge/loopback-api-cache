import { Constructor, Provider } from '@loopback/context';
import { CacheMetadata } from "../decorators";
export declare class CacheMetadataProvider implements Provider<CacheMetadata | undefined> {
    private readonly controllerClass;
    private readonly methodName;
    constructor(controllerClass: Constructor<{}>, methodName: string);
    value(): CacheMetadata | undefined;
}
