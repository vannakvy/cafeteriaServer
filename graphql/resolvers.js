import telegramUserResolvers from './resolvers/telegram/telegramUser.js'
import telegramChatResolvers from './resolvers/telegram/telegramChat.js'
import telegramOrderResolvers from './resolvers/telegram/telegramOrder.js'
import categoryResolvers from './resolvers/pos/category.js'
import productResolvers from './resolvers/pos/product.js'
import customerResolvers from './resolvers/pos/customer.js'
import deliverResolvers from './resolvers/pos/deliver.js'
import supplierResolvers from './resolvers/pos/supplier.js'
import purchaseOrderResolvers from './resolvers/pos/purchaseOrder.js'
import saleOrderResolvers from './resolvers/pos/saleOrder.js'
import globalResolvers from './resolvers/pos/global.js'
import reconciliationResolvers from './resolvers/pos/reconciliation.js'

const index = {
    ...globalResolvers.General,
    Query: {
        ...categoryResolvers.Query,
        ...productResolvers.Query,
        ...customerResolvers.Query,
        ...deliverResolvers.Query,
        ...supplierResolvers.Query,
        ...purchaseOrderResolvers.Query,
        ...saleOrderResolvers.Query,
        ...reconciliationResolvers.Query,

        ...telegramUserResolvers.Query
    },
    Mutation: {
        ...categoryResolvers.Mutation,
        ...productResolvers.Mutation,
        ...customerResolvers.Mutation,
        ...deliverResolvers.Mutation,
        ...supplierResolvers.Mutation,
        ...purchaseOrderResolvers.Mutation,
        ...saleOrderResolvers.Mutation,
        ...reconciliationResolvers.Mutation,

        ...telegramUserResolvers.Mutation,
        ...telegramChatResolvers.Mutation,
        ...telegramOrderResolvers.Mutation,
    },
    Subscription: {
        ...categoryResolvers.Subscription,
        ...productResolvers.Subscription,
        ...customerResolvers.Subscription,
        ...deliverResolvers.Subscription,
        ...supplierResolvers.Subscription,
        ...purchaseOrderResolvers.Subscription,

        ...saleOrderResolvers.Subscription,

        ...globalResolvers.Subscription
    }
}

export default index

