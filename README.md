# loopback-api-cache

A LoopBack 4 component for controller cache support.

## Overview

The component lets you cache (using any cache mechanism Redis, Memcached, etc) the response of an endpoint
using the @cache() decorator.

## Installation

```shell
npm install --save git+https://git@github.com/getlarge/loopback-api-cache#build
```

## How to use it

Start by creating a Model for the cache.
It should have `id: string`, `data: any` and `ttl: number` fields.

```sh
lb4 model
```

```sh
? Model class name: cache
? Please select the model base class (Use arrow keys)
❯ Entity (A persisted model with an ID) 
? Allow additional (free-form) properties? (y/N) No

? Enter the property name: id
? Property type: (Use arrow keys)
❯ string 
? Is id the ID property? (y/N) Yes
? Is it required?: Yes
? Default value [leave blank for none]: 

...
```

At the end you would have something like

```ts
// src/models/cache.model.ts
import { Entity, model, property } from '@loopback/repository';

@model()
export class Cache extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  id: string;

  @property({
    type: 'any',
    required: true,
  })
  data: any;

  @property({
    type: 'number',
    required: true,
  })
  ttl: number;

  constructor(data?: Partial<Cache>) {
    super(data);
  }
}
```

Now create the cache datasource ( Key Value based ) and repository of your choice.
We are going to be using Redis for this example.

```sh
lb4 datasource
? Datasource name: cache
? Select the connector for cache: 
❯ Redis key-value connector (supported by StrongLoop) 
...
```

```sh
lb4 repository
❯ CacheDatasource 
? Select the model(s) you want to generate a repository 
❯◉ Cache
...
```
For more information on how to create datasources or repositories go to

https://loopback.io/doc/en/lb4/Command-line-interface.html
https://loopback.io/doc/en/lb4/DataSources.html
https://loopback.io/doc/en/lb4/Repositories.html


Decorate your controller methods with `@cache(ttl)` to be able to cache the response.

```ts
// src/controllers/user.controller.ts
import { repository } from '@loopback/repository';
import { get, param } from '@loopback/rest';
import { cache } from 'loopback-api-cache';
import { UserRepository } from '../repositories';

export class UserController {
  constructor(@repository(UserRepository) protected userRepository: UserRepository) {}

  // caching response for 60 seconds
  @cache(60)
  @get('/user/:id')
  user(@param.path.string('id') id: string): Promise<User> {
    return this.userRepository.findById(id);
  }
}
```

Next, implement a cache strategy provider.

```ts
// src/providers/cache-strategy.provider.ts
import { inject, Provider, ValueOrPromise } from '@loopback/core';
import { repository } from '@loopback/repository';
import { CacheBindings, CacheMetadata, CacheStrategy } from 'loopback-api-cache';
import { Cache } from '../models';
import { CacheRepository } from '../repositories';

export class CacheStrategyProvider implements Provider<CacheStrategy | undefined> {
  constructor(
    @inject(CacheBindings.METADATA)
    private metadata: CacheMetadata,
    @repository(CacheRepository) protected cacheRepo: CacheRepository
  ) {}

  value(): ValueOrPromise<CacheStrategy | undefined> {
    if (!this.metadata) {
      return undefined;
    }

    const getCacheKey = (req: Request): string => {
      let reqParams = {path: req.path};
      if (req.query) {
        reqParams = {...reqParams, ...req.query};
      }
      const buff = Buffer.from(JSON.stringify(reqParams));
      const cacheKey = buff.toString('base64');
      return cacheKey;
    };

    return {
      check: (req: Request) => {
        const cacheKey = getCacheKey(req);
        this.cacheRepo.get(path).catch(err => {
          console.error(err);
          return undefined;
        }),
      set: async (req: Request, result: any) => {
        const cacheKey = getCacheKey(req);
        const ttl = this.metadata.ttl && this.metadata.ttl > 0 ? this.metadata.ttl : 0;
        const cache = new Cache({ id: result.id, data: result, ttl });
        this.cacheRepo.set(path, cache, { ttl: ttl * 1000 }).catch(err => {
          console.error(err);
        });
      },
    };
  }
}
```

In order to perform the check and set of our cache, we need to implement a custom Sequence
invoking the corresponding methods at the right time during the request handling.

```ts
// src/sequence.ts
import { inject } from '@loopback/context';
import { FindRoute, InvokeMethod, ParseParams, Reject, RequestContext, RestBindings, Send, SequenceHandler } from '@loopback/rest';
import { CacheBindings, CacheCheckFn, CacheSetFn } from 'loopback-api-cache';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(CacheBindings.CACHE_CHECK_ACTION) protected checkCache: CacheCheckFn,
    @inject(CacheBindings.CACHE_SET_ACTION) protected setCache: CacheSetFn
  ) {}

  async handle(context: RequestContext) {
    try {
      const { request, response } = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);

      // Important part added to check for cache and respond with that if found
      const cache = await this.checkCache(request);
      if (cache) {
        this.send(response, cache.data);
        return;
      }

      const result = await this.invoke(route, args);
      this.send(response, result);

      // Important part added to set cache with the result
      this.setCache(request, result);
    } catch (error) {
      this.reject(context, error);
    }
  }
}
```

Don't forget to inject `CacheBindings.CACHE_CHECK_ACTION` and `CacheBindings.CACHE_SET_ACTION`

```diff
+ @inject(CacheBindings.CACHE_CHECK_ACTION) protected checkCache: CacheCheckFn,
+ @inject(CacheBindings.CACHE_SET_ACTION) protected setCache: CacheSetFn,
```


Finally, put it all together in your application class:

```ts
// src/application.ts
import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { RestApplication, RestBindings, RestServer } from '@loopback/rest';
import { CacheBindings, CacheComponent } from 'loopback-api-cache';
import { CacheStrategyProvider } from './providers';
import { MySequence } from './sequence';

export class MyApp extends BootMixin(RestApplication) {
  constructor(options?: ApplicationConfig) {
    super(options);

    this.projectRoot = __dirname;

    // Add these two lines to your App
    this.component(CacheComponent);
    this.bind(CacheBindings.CACHE_STRATEGY).toProvider(CacheStrategyProvider);

    this.sequence(MySequence);
  }

  async start() {
    await super.start();

    const server = await this.getServer(RestServer);
    const port = await server.get(RestBindings.PORT);
    console.log(`REST server running on port: ${port}`);
  }
}
```


## Contributors

See
[all contributors](https://github.com/alfonsocj/loopback-api-cache/graphs/contributors).
