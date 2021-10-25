import pkg from 'mongoose';
const { model, Schema } = pkg;

const purchaseOrderSchema = new Schema({
    supplier:{
        type: Schema.Types.ObjectId,
        ref: "Suppliers"
    },
    tel: String,
    date: String,
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
        }
    ],
    subTotal: Number,
    tax: Number,
    offer: Number,
    grandTotal: Number,
    status: {
        isPrepared: Boolean,
        isCooked: Boolean,
        isDelivered: Boolean,
        isPaid: Boolean,
    },
    payment: [
        {
            id: {
                type: Schema.Types.ObjectId,
                ref: "Payments"
            }
        }
    ],
    geolocation: {
        lat: Number,
        long: Number,
    },
    createAt: String,
    updateAt: String,
})

const PurchaseOrders = model('PurchaseOrders', purchaseOrderSchema)

export default PurchaseOrders