import { gql } from 'apollo-server'

const category = gql`

    type Category {
        id: String!
        description: String!
        createAt: String
        updateAt: String
    }

    type CategoryResponse {
        data: [Category]
        message: String!
    }

    input CategoryInputSet {
        description: String!
    }

    input CategoryInputUpdate {
        id: String!
        description: String!
    }
    
    input CategoryInputDelete {
        id: String!
    }

    type Query {
        getCategories: CategoryResponse
        getCategoriesRangeDate(input: InputRangeDate): CategoryResponse
    }

    type Mutation {
        setCategories(input: CategoryInputSet): Category
        updateCategories(input: CategoryInputUpdate): String
        deleteCategories(input: CategoryInputDelete): String
    }

    type Subscription{
        newCategory: Category!
    }
    
`;

export default category