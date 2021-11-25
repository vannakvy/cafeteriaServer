import { gql } from 'apollo-server'

const content = gql`
    type Content {
        id: ID
        title: String
        path: String
        sub: ID
        menu: Boolean
        type: String
    }

    input ContentInput {
        title: String
        path: String
        sub: String
        menu: Boolean
        type: String
    }

    type Query {
        getContent: [Content]
    }

    type Mutation {
        addContent(input: ContentInput): String
    }
`;

export default content