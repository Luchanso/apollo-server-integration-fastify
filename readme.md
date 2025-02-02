<a href='https://www.apollographql.com/'><img src='https://avatars.githubusercontent.com/u/17189275?s=200' style="border-radius: 6px; margin-right: 6px" height='100' alt='Apollo Server'></a>
<a href='https://www.fastify.io/'><img src='https://avatars.githubusercontent.com/u/24939410?s=200' style="border-radius: 6px" height='100' alt='Fastify'></a>

[![NPM version](https://badge.fury.io/js/@as-integrations%2Ffastify.svg)](https://www.npmjs.com/package/@as-integrations/fastify)
[![NPM downloads](https://img.shields.io/npm/dm/@as-integrations/fastify.svg?style=flat)](https://www.npmjs.com/package/@as-integrations/fastify)

# Apollo Server Fastify

## Introduction

**An Apollo Server integration for use with Fastify.**

This is a simple package that easily allows you to connect your own Fastify server implementation to an Apollo Server instance.

## **Requirements**

- **[Node.js v14](https://nodejs.org/)** or later
- **[Fastify v4](https://www.fastify.io/)** or later
- **[GraphQL.js v16](https://graphql.org/graphql-js/)** or later
- **[Apollo Server v4](https://www.apollographql.com/docs/apollo-server/)** or later

## **Installation**

```bash
npm install @as-integrations/fastify @apollo/server graphql fastify
```

## **Usage**

Setup [Fastify](https://www.fastify.io/) & [Apollo Server](https://www.apollographql.com/docs/apollo-server/) like you usually would and then connect the two by using the `fastifyApollo` plugin:

```typescript
import Fastify from "fastify";
import { ApolloServer, BaseContext } from "@apollo/server";
import fastifyApollo, { fastifyApolloDrainPlugin } from "@as-integrations/fastify";
// ...

const fastify = Fastify();

const apollo = new ApolloServer<BaseContext>({
	typeDefs,
	resolvers,
	plugins: [fastifyApolloDrainPlugin(fastify)],
});

await apollo.start();

// ...

await fastify.register(fastifyApollo(apollo));
```

Alternatively you can use the exported function `fastifyApolloHandler` which can be passed into any [Fastify route handler](https://www.fastify.io/docs/latest/Reference/Routes/).
This allows you to explicitly set all routing options, for example the URL path and accepted methods.

Examples shown below:

```typescript
import { fastifyApolloHandler } from "@as-integrations/fastify";

// ... setup Fastify & Apollo

fastify.post("/graphql", fastifyApolloHandler(apollo));
// OR
fastify.get("/api", fastifyApolloHandler(apollo));
// OR
fastify.route({
	url: "/graphql",
	method: ["GET", "POST", "OPTIONS"],
	handler: fastifyApolloHandler(apollo),
});
```

Please see the [example](https://github.com/apollo-server-integrations/apollo-server-integration-fastify/tree/main/example).

## **Context**

Apollo Server 4 (AS4) has moved context setup outside of the `ApolloServer` constructor.

Define you're own context function and pass it in to the `context` option. For example:

```typescript
import { ApolloServer } from "@apollo/server";
import fastifyApollo, {
	fastifyApolloHandler,
	ApolloFastifyContextFunction,
} from "@as-integrations/fastify";
// ...

interface MyContext {
	authorization: JWTPayload | false;
}

const apollo = new ApolloServer<MyContext>({ resolvers, typeDefs });

const myContextFunction: ApolloFastifyContextFunction<MyContext> = async request => ({
	authorization: await isAuthorized(request.headers.authorization),
});

await fastify.register(fastifyApollo(apollo), {
	context: myContextFunction,
});

// OR

await fastify.post(
	"/graphql",
	fastifyApolloHandler(apollo, {
		context: myContextFunction,
	}),
);
```

## **API**

All options and generics are optional other than passing in the `ApolloServer` instance.

### `fastifyApollo`

```typescript
export default function fastifyApollo<Context extends BaseContext = BaseContext>(
	apollo: ApolloServer<Context>,
): FastifyPluginAsync<ApolloFastifyPluginOptions<Context>>;
```

### `fastifyApolloHandler`

```typescript
export function fastifyApolloHandler<Context extends BaseContext = BaseContext>(
	apollo: ApolloServer<Context>,
	options?: ApolloFastifyHandlerOptions<Context>,
): RouteHandlerMethod;
```

### `ApolloFastifyContextFunction`

```typescript
export type ApolloFastifyContextFunction<Context> = (
	request: FastifyRequest,
	reply: FastifyReply,
) => Promise<Context>;
```

### `ApolloFastifyPluginOptions`:

- `path`
  - type: `string | undefined`
  - default: `"/graphql"`
- `method`
  - type: `HTTPMethod | HTTPMethod[]`
  - default: `["GET", "POST", "OPTIONS"]`
- `context`
  - type: [ApolloFastifyContextFunction](#ApolloFastifyContextFunction)
  - default: `async () => ({})`

[`HTTPMethod`](https://www.fastify.io/docs/latest/Reference/TypeScript/#fastifyhttpmethods) is exported from Fastify.

### `ApolloFastifyHandlerOptions`:

- `context`
  - type: [ApolloFastifyContextFunction](#ApolloFastifyContextFunction)
  - default: `async () => ({})`

### HTTPS/HTTP2

All functions and types optionally allow you to pass in a Server type to Fastify (the default is `http.Server`).

## **Node.JS v14**

Please pass in `forceConnections: true` to Fastify to correctly shutdown you're server on close and not hang incoming requests.

## **Contributors**

- Oliver Plummer ([olyop](https://github.com/olyop))
- Trevor Scheer ([trevor-scheer](https://github.com/trevor-scheer))
