import { gql } from 'apollo-server'

const reconciliation = gql`

    type Reconciliation {
        id: String
        code: String
        products: [ReconProducts]
        accounting: SubAccounting
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

    type SubAccounting {
        openning: PaidNonPaid
        income: PaidNonPaid
        expense: PaidNonPaid
        closing: PaidNonPaid
    }

    type PaidNonPaid {
        paid: Float
        nonPaid: Float
    }

    input GenerateInvInput {
        date: String
        remark: String
    }

    input GenerateAccInput {
        id: String
    }

    input PaidNonPaidInput {
        paid: Float
        nonPaid: Float
    }

    type Query {
        phsicalInventory(input: InputPagination): [Reconciliation]
        getInventory(input: InputPagination): [Reconciliation]
    }

    type Mutation {
        generateInventory(input: GenerateInvInput): String
        generateAccounting(input: GenerateAccInput): String
    }
    
`;

export default reconciliation