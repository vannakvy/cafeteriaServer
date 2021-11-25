import { gql } from 'apollo-server'

const purchaseOrder = gql`

    type PurchaseOrder {
        id: ID
        code: String
        supplier: Supplier
        tel: String
        date: Float
        remark: String
        products: [PurchaseOrderProduct]!
        productCount: Int
        subTotal: Float
        tax: Float
        offer: Float
        delivery: Float
        grandTotal: Float
        payment: Float
        createAt: String
        updateAt: String
    }

    type PurchaseOrderProduct {
        product: Product
        price: Float
        qty: Float!
        total: Float!
        id: ID
    }

    type PurchaseOrderResponse {
        data: [PurchaseOrder]
        message: String!
        pagination: Pagination
    }

    input PurchaseOrderInputSet {
        supplier: String!
        tel: String
        date: String!
        remark: String
        products: [PurchaseOrderInputSubSet]!
        subTotal: Float
        tax: Float
        offer: Float
        delivery: Float
        grandTotal: Float
        payment: Float
    }

    input PurchaseOrderInputSubSet {
        product: String!
        price: Float
        qty: Float!
        total: Float!
        remark: String
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
        delivery: Float
        grandTotal: Float
        payment: Float
    }
    
    input PurchaseOrderInputDelete {
        id: String!
    }

    input PurchaseOrderInputSubAdd {
        orderId: String!
        id: String!
        price: Float
        qty: Float!
        total: Float!
        remark: String
    }

    input PurchaseOrderInputSubUpdate {
        orderId: String!
        id: String!
        price: Float
        qty: Float
        total: Float
        remark: String
    }

    type Query {
        getPurchaseOrders(input: InputPagination): PurchaseOrderResponse
        getPurchaseOrderById(input: InputId): PurchaseOrder
        getPurchaseOrdersRangeDate(input: InputRangeDate): PurchaseOrderResponse
    }

    type Mutation {
        setPurchaseOrders(input: PurchaseOrderInputSet): PurchaseOrder
        updatePurchaseOrders(input: PurchaseOrderInputUpdate): String
        deletePurchaseOrders(input: PurchaseOrderInputDelete): String

        setSubPurchaseOrders(input: PurchaseOrderInputSubAdd): String
        updateSubPurchaseOrders(input: PurchaseOrderInputSubUpdate): String
        deleteSubPurchaseOrders(input: PurchaseOrderInputDelete): String
    }

    type Subscription{
        newPurchaseOrder: PurchaseOrder!
    }
    
`;

export default purchaseOrder