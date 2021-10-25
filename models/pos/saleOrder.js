import pkg from 'mongoose';
const { model, Schema } = pkg;

const SaleOrderSchema = new Schema({
    customer:{
        type: Schema.Types.ObjectId,
        ref: "Customers"
    },
    tel: String,
    date: String,
    remark: String,
    products: [
        {
            id: {
                type: Schema.Types.ObjectId,
                ref: "Products"
            },
            price: Number,
            qty: Number,
            um: String,
            total: Number,
        }
    ],
    subTotal: Number,
    tax: Number,
    offer: Number,
    delivery: Number,
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
    deliver:{
        type: Schema.Types.ObjectId,
        ref: "Delivers",
    },
    geolocation: {
        lat: Number,
        long: Number,
    },
    rating: {
        rating: Number,
        comment: String,
    },
    feedback: {
        comment: String,
    },
    createAt: String,
    updateAt: String,
})

const SaleOrder = model('SaleOrder', SaleOrderSchema)

export default SaleOrder