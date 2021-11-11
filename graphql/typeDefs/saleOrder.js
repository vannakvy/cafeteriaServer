import { gql } from 'apollo-server'

const saleOrder = gql`

    type SaleOrder {
        id: String!
        customer: SaleOrderCustomer
        deliver: SaleOrderDeliver
        tel: String
        date: Float
        remark: String
        products: [SaleOrderProduct]
        productCount: Int
        subTotal: Float
        tax: Float
        offer: Float
        grandTotal: Float
        delivery: Float
        status: Status
        payment: Float
        geolocation: Geolocation
        rate: Rate
        feedback: String
        createAt: String
        updateAt: String
    }

    type SaleOrderCustomer{
        id: Customer
        tel: String
        geolocation: Geolocation
        remark: String
    }

    type SaleOrderDeliver{
        id: Deliver
        tel: String
        geolocation: Geolocation
        remark: String
    }

    type SaleOrderProduct {
        product: Product
        price: Float
        qty: Float!
        total: Float!
        remark: String
        id: String
    }

    type SaleOrderResponse {
        data: [SaleOrder]
        message: String!
        pagination: Pagination
    }

    input SaleOrderInputSet {
        customer: SaleOrderInputPerson!
        deliver: SaleOrderInputPerson
        tel: String
        date: String!
        remark: String
        products: [SaleOrderInputSubSet]!
        subTotal: Float
        tax: Float
        offer: Float
        grandTotal: Float
        delivery: Float
        payment: Float
        status: InputStatus
        geolocation: InputGeolocation
        rate: InputRate
        feedback: String
    }

    input SaleOrderInputPerson{
        id: String
        tel: String
        geolocation: InputGeolocation
        remark: String
    }

    input SaleOrderInputSubSet {
        product: String!
        price: Float
        qty: Float!
        total: Float!
        remark: String
    }

    input SaleOrderInputUpdate {
        id: String!
        customer: SaleOrderInputPerson
        deliver: SaleOrderInputPerson
        tel: String
        date: String
        remark: String
        subTotal: Float
        tax: Float
        offer: Float
        grandTotal: Float
        delivery: Float
        payment: Float
        status: InputStatus
        geolocation: InputGeolocation
        rate: InputRate
        feedback: String
    }
    
    input SaleOrderInputDelete {
        id: String!
    }

    input SaleOrderInputSubAdd {
        orderId: String!
        id: String!
        price: Float
        qty: Float!
        total: Float!
        remark: String
    }

    input SaleOrderInputSubUpdate {
        orderId: String!
        id: String!
        price: Float
        qty: Float
        total: Float
        remark: String
    }

    type Query {
        getSaleOrders(input: InputPagination): SaleOrderResponse
        getSaleOrderById(input: InputId): SaleOrder
        getSaleOrdersByCustomerId(input: InputPagination): SaleOrderResponse
        getSaleOrdersBadgeByCustomerId(input: InputPagination): Int
        getSaleOrdersRangeDate(input: InputRangeDate): SaleOrderResponse
    }

    type Mutation {
        setSaleOrders(input: SaleOrderInputSet): SaleOrder
        updateSaleOrders(input: SaleOrderInputUpdate): String
        deleteSaleOrders(input: SaleOrderInputDelete): String

        setSubSaleOrders(input: SaleOrderInputSubAdd): String
        updateSubSaleOrders(input: SaleOrderInputSubUpdate): String
        deleteSubSaleOrders(input: SaleOrderInputDelete): String

        updateOrderStatus(input: InputStatusWithId): Status
    }

    type Subscription{
        newSaleOrder: SaleOrder!
    }
    
`;

export default saleOrder