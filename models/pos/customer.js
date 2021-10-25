import pkg from 'mongoose';
const { model, Schema } = pkg;

const customersSchema = new Schema({
    lname: String,
    fname: String,
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

const Customers = model('Customers', customersSchema)

export default Customers