import pkg from 'mongoose';
const { model, Schema } = pkg;

const suppliersSchema = new Schema({
    idCard: String,
    companyName: String,
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

const Suppliers = model('Suppliers', suppliersSchema)

export default Suppliers