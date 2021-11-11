import pkg from 'mongoose';
const { model, Schema } = pkg;

const customersSchema = new Schema({
    idCard: String,
    lname: String,
    fname: String,
    tel: String,
    email: String,
    image: String,
    address: String,
    geolocation: {
        lat: Number,
        long: Number,
        placename: String
    },
    uid: String,
    token: String,
    createAt: Date,
    updateAt: Date,
})

const Customers = model('Customers', customersSchema)

export default Customers