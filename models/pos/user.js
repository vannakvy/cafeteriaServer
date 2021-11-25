import pkg from 'mongoose';
const { model, Schema } = pkg;

const usersSchema = new Schema({
    uid: String,
    token: String,
    displayName: String,
    email: String,
    contentRole: [
        {
            content: {
                type: Schema.Types.ObjectId,
                ref: "Contents"
            },
            view: {
                type: Boolean,
                default: false
            },
            create: {
                type: Boolean,
                defualt: false
            },
            update: {
                type: Boolean,
                defualt: false
            },
            delete: {
                type: Boolean,
                defualt: false
            }
        } 
    ],
    createAt: Date,
    updateAt: Date,
})

const Users = model('Users', usersSchema)

export default Users