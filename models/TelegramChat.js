import pkg from 'mongoose';
const { model, Schema } = pkg;

const chatSchema = new Schema({
    text: String,
    typeText: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'TelegramUser'
    },
    createdAt: String,
})

const TelegramChat = model('TelegramChat', chatSchema)

export default TelegramChat