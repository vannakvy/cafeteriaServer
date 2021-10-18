import { gql } from 'apollo-server'

const gqlState = gql`

    type Geolocation {
        lat: Float
        long: Float
    }

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
`;

export default gqlState