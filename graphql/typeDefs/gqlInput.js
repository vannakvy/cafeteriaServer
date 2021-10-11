import { gql } from 'apollo-server'

const gqlInput = gql`
    input RegisterInput{
        username: String!
        password: String!
        confirmPassword: String!
        email: String!
    }

    input PaginationInput{
        limit: Int!
        keyword: String
    }
`;

export default gqlInput