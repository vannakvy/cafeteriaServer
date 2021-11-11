import pkg from 'mongoose';
const { model, Schema } = pkg;

const purchaseOrderSchema = new Schema({
    code: String,
    supplier: {
        type: Schema.Types.ObjectId,
        ref: "Suppliers"
    },
    tel: String,
    date: Date,
    remark: String,
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Products"
            },
            price: Number,
            qty: Number,
            total: Number,
            remark: String,
        }
    ],
    subTotal: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    offer: {
        type: Number,
        default: 0
    },
    delivery: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number,
        default: 0
    },
    payment: {
        type: Number,
        default: 0
    },
    createAt: Date,
    updateAt: Date,
})

const PurchaseOrders = model('PurchaseOrders', purchaseOrderSchema)

export default PurchaseOrders