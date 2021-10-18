import telegramUserResolvers from './resolvers/telegramUser.js'
import telegramChatResolvers from './resolvers/telegramChat.js'
import telegramOrderResolvers from './resolvers/telegramOrder.js'

const index = {
    Query: {
        ...telegramUserResolvers.Query
    },
    Mutation: {
        ...telegramUserResolvers.Mutation,
        ...telegramChatResolvers.Mutation,
        ...telegramOrderResolvers.Mutation,
    }
}

export default index

