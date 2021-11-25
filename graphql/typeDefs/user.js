import { gql } from 'apollo-server'

const user = gql`
    type User {
        id: ID
        uid: String,
        token: String,
        displayName: String,
        email: String,
        contentRole: [ContentRole]
    }

    type ContentRole {
        content: Content
        sub: String
        view: Boolean
        create: Boolean
        update: Boolean
        delete: Boolean
    }

    type UserContent {
        _id: ID
        title: String
        path: String
        contentId: ID
        view: Boolean
        create: Boolean
        update: Boolean
        delete: Boolean
        sub: String
        menu: Boolean
    }

    type UserContentResponse {
        profile: User
        content: [UserContent]
    }

    type UserResponse {
        data: [User]
        pagination: Pagination
    }
    
    input AddUserInput {
        displayName: String
        email: String
        password: String
        contentRole: [ContentRoleInput]!
    }

    input UpdateUserInput {
        id: ID!
        uid: String!
        displayName: String
        email: String
        password: String
    }

    input ContentRoleInput {
        content: String!
        view: Boolean!
        create: Boolean!
        update: Boolean!
        delete: Boolean!
    }

    input UpdateContentInput {
        id: ID
        contentRole: [ContentRoleInput]
    }

    type Query {
        getUsers(input: InputPagination): UserResponse
        getContentById(input: InputId): UserContentResponse
    }

    type Mutation {
        addUser(input: AddUserInput): User
        updateUser(input: UpdateUserInput): String
        deleteUser(input: InputId): String
        updateContent(input: UpdateContentInput): String
    }
`;

export default user