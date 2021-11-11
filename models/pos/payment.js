import pkg from 'mongoose';
const { model, Schema } = pkg;

const paymentSchema = new Schema({
    date: String,
    amount: Number,
    type: String,
    payFor: [
        {
            id: Schema.Types.ObjectId,
        }
    ],
    createAt: Date,
    updateAt: Date,
})

const Payments = model('Payments', paymentSchema)

export default Payments