import pkg from 'mongoose';
const { model, Schema } = pkg;

const deliversSchema = new Schema({
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

const Delivers = model('Delivers', deliversSchema)

export default Delivers