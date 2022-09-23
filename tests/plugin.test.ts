import Fastify from "fastify"
import { ApolloServer, ApolloServerOptions, BaseContext } from "@apollo/server"
import {
	CreateServerForIntegrationTestsOptions,
	defineIntegrationTestSuite,
} from "@apollo/server-integration-testsuite"

import fastifyApollo, { fastifyApolloDrainPlugin } from "../src"

defineIntegrationTestSuite(
	async (serverOptions: ApolloServerOptions<BaseContext>, testOptions?: CreateServerForIntegrationTestsOptions) => {
		const fastify = Fastify()

		const apollo = new ApolloServer({
			...serverOptions,
			plugins: [...(serverOptions.plugins ?? []), fastifyApolloDrainPlugin(fastify)],
		})

		await apollo.start()

		const options = testOptions?.context ? { context: testOptions?.context } : undefined

		await fastify.register(fastifyApollo(apollo), {
			...options,
			path: "/",
			method: [
				"GET",
				"POST",
				// @ts-expect-error Note: we register for HEAD mostly because the
				// integration test suite ensures that our middleware appropriate rejects
				// such requests. In your app, you would only want to register for GET and
				// POST.
				"HEAD",
			],
		})

		const url = await fastify.listen({ port: 0 })

		return {
			server: apollo,
			url,
		}
	},
)
