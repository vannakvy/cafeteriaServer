import pkg from 'mongoose';
const { model, Schema } = pkg;

const categoriesSchema = new Schema({
    description: String,
    createAt: Date,
    updateAt: Date,
})

const Categories = model('Categories', categoriesSchema)

export default Categories