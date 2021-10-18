import { gql } from 'apollo-server'

const gqlMethod = gql`
    type Query{
        getTelegramAdmins: [TelegramUser]
        getTelegramUsers(user_id: Int!): TelegramUser
    }
    type Mutation{
        telegramRegister(input: TelegramRegInput):TelegramUserResponse
        telegramUserUpdate(input: TelegramUserInput):TelegramUserResponse
        telegramChat(input: TelegramChatInput):TelegramChatResponse
        telegramOrder(input: TelegramOrderInput): TelegramOrderResponse
        telegramOrderUpdate(input: TelegramOrderInput): TelegramOrderResponse
        telegramOrderDelete(orderId: String): TelegramResponse
    }
`;

export default gqlMethod