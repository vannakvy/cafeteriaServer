import { AuthenticationError } from "apollo-server-errors"
import { getAuth } from 'firebase-admin/auth'
import { convertTZ } from "../../../functions/fn.js"
import Suppliers from "../../../models/pos/supplier.js"
import mongoose from 'mongoose'
import Contents from "../../../models/pos/content.js"

const contentResolvers = {
    Query: {
        async getContent(){
            try {
                const contents = await Contents.find().sort({createAt: 1})

                // console.log(contents)

                return contents
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Mutation: {
        async addContent(_, {
            input
        }, context){
            try {
                // console.log(input)
                const newContent = new Contents({
                    ...input,
                    createAt: convertTZ(new Date())
                })

                const content = await newContent.save()

                if(content){
                    return "ការបញ្ចូលបានជោគជ័យ!"
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Subscription: {

    }
}

export default contentResolvers