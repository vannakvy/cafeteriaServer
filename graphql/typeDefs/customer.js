import { gql } from 'apollo-server'

const customer = gql`

    type Customer {
        id: String!
        idCard: String!
        lname: String!
        fname: String!
        tel: String
        email: String
        image: String
        address: String
        geolocation: Geolocation
        uid: String
        token: String
        createAt: String
        updateAt: String
    }

    type CustomerResponse {
        data: [Customer]
        message: String!
        pagination: Pagination
    }

    input CustomerInputSet {
        idCard: String
        lname: String!
        fname: String!
        tel: String
        email: String
        image: String
        address: String
        geolocation: InputGeolocation
        uid: String
        token: String
    }

    input CustomerInputUpdate {
        id: String!
        lname: String
        fname: String
        tel: String
        email: String
        image: String
        address: String
        geolocation: InputGeolocation
        uid: String
        token: String
    }
    
    input CustomerInputDelete {
        id: String!
    }

    type Query {
        getCustomers(input: InputPagination): CustomerResponse
        getCustomersRangeDate(input: InputRangeDate): CustomerResponse
    }

    type Mutation {
        setCustomers(input: CustomerInputSet): Customer
        updateCustomers(input: CustomerInputUpdate): String
        deleteCustomers(input: CustomerInputDelete): String
    }

    type Subscription{
        newCustomer: Customer!
    }
    
`;

export default customer