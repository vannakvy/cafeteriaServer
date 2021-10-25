import { gql } from 'apollo-server'

const purchaseOrder = gql`

    type PurchaseOrder {
        id: String!
        supplier: String!
        tel: String
        date: String!
        remark: String
        products: [PurchaseOrderProduct]!
        subTotal: Float
        tax: Float
        offer: Float
        grandTotal: Float
        status: Status
        payment: [String]
        geolocation: Geolocation
        createAt: String
        updateAt: String
    }

    type PurchaseOrderProduct {
        product: Product
        price: Float
        qty: Float!
        total: Float!
    }

    type PurchaseOrderResponse {
        data: [PurchaseOrder]
        message: String!
    }

    input PurchaseOrderInputSet {
        supplier: String!
        tel: String
        date: String!
        remark: String
        products: [PurchaseOrderProductInput]!
        subTotal: Float
        tax: Float
        offer: Float
        grandTotal: Float
        status: InputStatus
        geolocation: InputGeolocation
    }

    input PurchaseOrderInputUpdate {
        id: String!
        supplier: String
        tel: String
        date: String
        remark: String
        subTotal: Float
        tax: Float
        offer: Float
        grandTotal: Float
        status: InputStatus
        geolocation: InputGeolocation
    }
    
    input PurchaseOrderInputDelete {
        id: String!
    }

    input PurchaseOrderProductInput {
        product: String!
        price: Float!
        qty: Float!
        total: Float!
    }

    input PurchaseOrderInputSubUpdate {
        id: String!
        price: Float
        qty: Float
        total: Float
    }

    type Query {
        getPurchaseOrders: PurchaseOrderResponse
        getPurchaseOrdersRangeDate(input: InputRangeDate): PurchaseOrderResponse
    }

    type Mutation {
        setPurchaseOrders(input: PurchaseOrderInputSet): PurchaseOrder
        updatePurchaseOrders(input: PurchaseOrderInputUpdate): String
        deletePurchaseOrders(input: PurchaseOrderInputDelete): String

        setSubPurchaseOrders(id: String, input: PurchaseOrderProductInput): String
        updateSubPurchaseOrders(input: PurchaseOrderInputSubUpdate): String
        deleteSubPurchaseOrders(input: PurchaseOrderInputDelete): String
    }

    type Subscription{
        newPurchaseOrder: PurchaseOrder!
    }
    
`;

export default purchaseOrder