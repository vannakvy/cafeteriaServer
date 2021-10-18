import { gql } from 'apollo-server'

const gqlInput = gql`

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
`;

export default gqlInput