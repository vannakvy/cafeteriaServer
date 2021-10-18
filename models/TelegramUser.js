import pkg from 'mongoose';
const { model, Schema } = pkg;

const userSchema = new Schema({
    phone_number: String,
    first_name: String,
    last_name: String,
    user_id: Number,
    user_type: Boolean,
    admin_type: Boolean,
    createdAt: String,
    geolocation: {
        lat: Number,
        long: Number,
    },
})

const TelegramUser = model('TelegramUser', userSchema)

export default TelegramUser