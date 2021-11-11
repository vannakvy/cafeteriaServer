import pkg from 'mongoose';
const { model, Schema } = pkg;

const SaleOrderSchema = new Schema({
    code: String,
    customer: {
        id: {
            type: Schema.Types.ObjectId,
            ref: "Customers"
        },
        tel: String,
        geolocation: {
            lat: String,
            long: String,
            placename: String,
        },
        remark: String,
    },
    tel: String,
    date: Date,
    remark: String,
    deliver: {
        id: {
            type: Schema.Types.ObjectId,
            ref: "Delivers",
        },
        tel: String,
        geolocation: {
            lat: String,
            long: String,
            placename: String,
        },
        remark: String,
    },
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
    status: {
        isPrepared: {
            type: Boolean,
            default: false
        },
        isCooked: {
            type: Boolean,
            default: false
        },
        isDelivered: {
            type: Boolean,
            default: false
        },
        deliveryTime: {
            type: String,
            default: "25"
        },
        isPaid: {
            type: Boolean,
            default: false
        },
        isCanceled: {
            type: Boolean,
            default: false
        }
    },
    geolocation: {
        lat: Number,
        long: Number,
    },
    rate: {
        rating: Number,
        comment: String,
    },
    feedback: String,
    createAt: Date,
    updateAt: Date,
})

const SaleOrder = model('SaleOrder', SaleOrderSchema)

export default SaleOrder