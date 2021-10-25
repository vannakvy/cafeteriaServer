import { gql } from 'apollo-server'

const telgram = gql`

    type TelegramUser{
        id: ID!
        phone_number: String!,
        first_name: String!,
        last_name: String!,
        user_id: Int!,
        user_type: Boolean!,
        admin_type: Boolean!,
        createdAt: String!,
    }

    type TelegramChat{
        id: ID!,
        text: String!,
        typeText: String!,
        createdAt: String!,
    }

    type TelegramOrder{
        id: ID!
        text: String
        typeText: String,
        geolocation: Geolocation
    }

    type TelegramUserResponse {
        data: TelegramUser
        message: String!
    }

    type TelegramChatResponse {
        data: TelegramChat
        message: Boolean!
    }

    type TelegramOrderResponse {
        data: TelegramOrder
        message: Boolean!
    }

    type TelegramResponse {
        message: Boolean!
    }

    input TelegramRegInput{
        phone_number: String!,
        first_name: String!,
        last_name: String!,
        user_id: Int!,
        user_type: Boolean!,
        admin_type: Boolean!,
    }

    input TelegramUserInput{
        user_id: Int!,
        lat: Float,
        long: Float,    
    }
    
    input TelegramChatInput{
        text: String!,
        typeText: String!,
        user_id: Int!,
    }

    input TelegramOrderInput{
        user_id: Int!,
        typeText: String,
        text: String,
        lat: Float,
        long: Float,
        orderId: String,
    }

    input PaginationInput{
        limit: Int!
        keyword: String
    }

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

export default telgram