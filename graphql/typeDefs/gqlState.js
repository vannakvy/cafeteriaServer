import { gql } from 'apollo-server'

const gqlState = gql`
    type Post{
        id: ID!
        body: String!
        createdAt: String!
        username: String!
        comments: [Comment]!
        likes: [Like]!
        likeCount: Int!
        commentCount: Int!
    }
    type User{
        id: ID!
        email: String!
        token: String!
        username: String!
        createdAt: String!
    }
    type Comment{
        id: ID!
        body: String!
        username: String!
        createdAt: String!
    }
    type Like{
        id: ID!
        createdAt: String!
        username: String!   
    }

    type Pagination{
        message: String!
        pageCount: Int!
    }

    type Response {
        data: [Post]
        pageInfo: Pagination!
    }
`;

export default gqlState