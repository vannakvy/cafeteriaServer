import pkg from 'mongoose';
const { model, Schema } = pkg;

const categoriesSchema = new Schema({
    description: String,
    createAt: String,
    updateAt: String,
})

const Categories = model('Categories', categoriesSchema)

export default Categories