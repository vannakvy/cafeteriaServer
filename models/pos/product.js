import pkg from 'mongoose';
const { model, Schema } = pkg;

const productsSchema = new Schema({
    code: String,
    description: String,
    image: String,
    price: Number,
    um: String,
    category: {
        type: Schema.Types.ObjectId,
        ref: "Categories"
    },
    inStock: Number,
    remark: String,
    createAt: String,
    updateAt: String,
})

const Products = model('Products', productsSchema)

export default Products