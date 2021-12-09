import { gql } from 'apollo-server'

const report = gql`
    type ReportProduct {
        _id: String
        description: String
        openning: Float
        stockIn: Float
        stockOut: Float
        totalStock: Float
    }

    type ReportCategory {
        _id: String
        description: String
        stockIn: Float
        stockOut: Float
        totalStock: Float
    }

    type Query {
        getReportProductByDate(input: InputDate): [ReportProduct]
        getReportProductByRangeDate(input: InputRangeDate): [ReportProduct]
        getReportCategoryByDate(input: InputRangeDate): [ReportCategory]
    }
`;

export default report