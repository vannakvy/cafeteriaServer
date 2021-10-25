import { gql } from 'apollo-server'

const product = gql`

    type Product {
        id: String!
        code: String!
        description: String!
        image: String
        price: Float!
        um: String!
        category: Category
        inStock: Float
        remark: String
        createAt: String
        updateAt: String
    }

    type ProductResponse {
        data: [Product]
        message: String!
    }

    input ProductInputSet {
        code: String!
        description: String!
        image: String
        price: Float!
        um: String!
        category: String!
    }

    input ProductInputUpdate {
        id: String!
        code: String
        description: String
        image: String
        price: Float
        um: String
        category: String
    }
    
    input ProductInputDelete {
        id: String!
    }

    type Query {
        getProducts: ProductResponse
        getProductsRangeDate(input: InputRangeDate): ProductResponse
    }

    type Mutation {
        setProducts(input: ProductInputSet): Product
        updateProducts(input: ProductInputUpdate): String
        deleteProducts(input: ProductInputDelete): String
    }

    type Subscription{
        newProduct: Product!
    }
    
`;

export default product