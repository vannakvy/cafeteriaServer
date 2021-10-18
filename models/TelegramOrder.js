import pkg from 'mongoose';
const { model, Schema } = pkg;

const orderSchema = new Schema({
    text: String,
    typeText: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'TelegramUser'
    },
    geolocation: {
        lat: Number,
        long: Number,
    },
    createdAt: String,
})

const TelegramOrder = model('TelegramOrder', orderSchema)

export default TelegramOrder