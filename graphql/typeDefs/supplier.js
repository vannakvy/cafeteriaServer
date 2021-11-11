import { gql } from 'apollo-server'

const supplier = gql`

    type Supplier {
        id: String
        companyName: String
        lname: String
        fname: String
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

    type SupplierResponse {
        data: [Supplier]
        message: String!
        pagination: Pagination
    }

    input SupplierInputSet {
        companyName: String!
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

    input SupplierInputUpdate {
        id: String!
        companyName: String
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
    
    input SupplierInputDelete {
        id: String!
    }

    type Query {
        getSuppliers(input: InputPagination): SupplierResponse
        getSuppliersRangeDate(input: InputRangeDate): SupplierResponse
    }

    type Mutation {
        setSuppliers(input: SupplierInputSet): Supplier
        updateSuppliers(input: SupplierInputUpdate): String
        deleteSuppliers(input: SupplierInputDelete): String
    }

    type Subscription{
        newSupplier: Supplier!
    }
    
`;

export default supplier