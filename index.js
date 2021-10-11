import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import typeDefs from './graphql/typeDefs.js'
import resolvers from './graphql/resolvers.js'
import { PubSub } from 'graphql-subscriptions';
import { MONGODBCONNECTION } from './config.js'
import cors from 'cors'
import dotenv from 'dotenv'

(async function () {
    const app = express();

    dotenv.config()

    app.use(cors())

    const pubsub = new PubSub();

    const httpServer = createServer(app);

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
    });

    const server = new ApolloServer({
        schema,
        context: ({ req }) => ({ req, pubsub }),
        plugins: [{
            async serverWillStart() {
                return {
                    async drainServer() {
                        subscriptionServer.close();
                    }
                };
            }
        }],
    });


    const subscriptionServer = SubscriptionServer.create(
        {
            schema,
            execute,
            subscribe,
            async onConnect(connectionParams, webSocket) {
                return { pubsub }
            }
        },
        { server: httpServer, path: server.graphqlPath }
    );


    await server.start();
    server.applyMiddleware({ app });

    const PORT = process.env.PORT

    new Promise(resolve => {
        resolve(MONGODBCONNECTION())
    }).then(
        () => {
            httpServer.listen(PORT, () =>
                console.log(`Server is now running on http://localhost:${PORT}/graphql`)
            );
        }, err => {
            console.log(err)
        }
    )

})();
