import { gql } from 'apollo-server'

const reconciliation = gql`

    type Reconciliation {
        id: String
        code: String
        products: [ReconProducts]
        date: Float
        remark: String
    }

    type ReconProducts {
        id: String
        openning: SubReconProducts
        stockIn: SubReconProducts
        stockOut: SubReconProducts
        physical: SubReconProducts
        variance: SubReconProducts
        closing: SubReconProducts
    }

    type SubReconProducts {
        qty: Float
        price: Float
        total: Float
    }

    input generateInvInput {
        date: String
        remark: String
    }

    type Query {
        phsicalInventory(input: InputPagination): [Reconciliation]
    }

    type Mutation {
        generateInventory(input: generateInvInput): String
    }
    
`;

export default reconciliation