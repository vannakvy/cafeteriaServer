import { gql } from 'apollo-server'

const dashboard = gql`
    type TopDashboard{
        newCustomer: Int
        newDeliver: Int
        newSupplier: Int
        customer: Int
        deliver: Int
        supplier: Int
    }

    type ExpenseData {
        paid: Float
        nonPaid: Float
    }

    type IncomeData {
        paid: Float
        nonPaid: Float
    }

    type TotalData {
        expense: Float
        income: Float
    }

    type DataRecord {
        _id: ID
        date: Int
        count: Int
        total: Float
    }

    type DataYearRecord {
        _id: ID
        code: String
        month: Int
        income: Float
        expense: Float
    }

    type DashboardResponse{
        top: TopDashboard
        topExp: [DataRecord]
        topInc: [DataRecord]
        expData: ExpenseData
        incData: IncomeData
        total: TotalData
        dataYearRecord: [DataYearRecord]
    }

    type Query {
        getDashboard: DashboardResponse
    }
    
`;

export default dashboard