import { gql } from 'apollo-server'

const gqlMethod = gql`
    type Query{
        getAllPosts: [Post]
        getAllPostsWithPagination(paginationInput: PaginationInput): Response!
        getPost(postId: ID!): Post
    }
    type Mutation{
        register(registerInput: RegisterInput): User!
        login(username:String!, password: String!): User!
        createPost(body: String!): Post!
        deletePost(postId: ID!): String!
        createComment(postId: String!, body: String!): Post!
        deleteComment(postId: ID!, commentId: ID!): Post!
        likePost(postId: ID!): Post!
    }
    type Subscription{
        newPost: Post!
    }
`;

export default gqlMethod