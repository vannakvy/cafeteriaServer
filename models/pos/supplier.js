import pkg from 'mongoose';
const { model, Schema } = pkg;

const suppliersSchema = new Schema({
    name: String,
    tel: String,
    email: String,
    image: String,
    address: String,
    geolocation: {
        lat: Number,
        long: Number,
    },
    uid: String,
    token: String,
    createAt: String,
    updateAt: String,
})

const Suppliers = model('Suppliers', suppliersSchema)

export default Suppliers