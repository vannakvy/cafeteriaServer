import pkg from 'mongoose';
const { model, Schema } = pkg;

const contentsSchema = new Schema({
    title: String,
    path: String,
    sub: Schema.Types.ObjectId,
    menu: {
        type: Boolean,
        default: false,
    },
    type: String,
    createAt: Date,
    updateAt: Date,
})

const Contents = model('Contents', contentsSchema)

export default Contents