
const globalResolvers = {
    General: {
        SaleOrder: {
            productCount: (parent) => parent.products.length
        },
    },
    Query: {
        
    },
    Mutation: {
        
    },
    Subscription: {
        newNotice: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['NEW_NOTICE'])
        }
    }
}

export default globalResolvers