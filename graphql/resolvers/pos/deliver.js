import { AuthenticationError } from "apollo-server-errors"
import { convertTZ } from "../../../functions/fn.js"
import Delivers from "../../../models/pos/deliver.js"
import mongoose from 'mongoose'

const deliverResolvers = {
    Query: {
        async getDelivers(_,{
            input
        }, context) {
            try {
                const reg = new RegExp(input?.keyword)
                let delivers = []
                if (input?.keyword === null || input?.keyword === "") {
                    delivers = await Delivers.find().sort({ createAt: -1 }).skip((input?.current - 1) * input?.limit).limit(input?.limit)
                } else {
                    if (mongoose.Types.ObjectId.isValid(input?.keyword)) {
                        delivers = await Delivers.find({
                            $or: [
                                { "_id": mongoose.Types.ObjectId(input?.keyword) }
                            ]
                        }).sort({ createAt: -1 }).skip((input?.current - 1) * input?.limit).limit(input?.limit)
                    } else {
                        delivers = await Delivers.find({
                            $or: [
                                { "lname": reg },
                                { "fname": reg }
                            ]
                        }).sort({ createAt: -1 }).skip((input?.current - 1) * input?.limit).limit(input?.limit)
                    }
                }

                const pageCount = await Delivers.countDocuments()

                return {
                    data: delivers,
                    message: "ការបញ្ចូលបានជោគជ័យ",
                    pagination: {
                        current: input?.current,
                        count: parseInt(pageCount)
                    }
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async getDeliversRangeDate(_, {
            input
        }, context) {
            try {
                const delivers = await Delivers.find(
                    { "createAt": { "$gte": convertQueryDate(input.startDate), "$lte": convertQueryDate(input.endDate) } }
                ).sort({ createdAt: -1 })

                return {
                    data: delivers,
                    message: "ការបញ្ចូលបានជោគជ័យ"
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Mutation: {
        async setDelivers(_, {
            input
        }, context) {
            try {
                const findDeliver = await Delivers.find({
                    $and: [
                        { "lname": input.lname },
                        { "fname": input.fname },
                    ]
                })

                if (findDeliver?.length === 0) {
                    const newDeliver = new Delivers({
                        ...input,
                        createAt: convertTZ(new Date())
                    })

                    const deliver = await newDeliver.save()

                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: deliver?.id,
                            action: "create",
                            title: `បានបង្កើតអ្នកដឹកជញ្ជូន`,
                            content: `លេខ៖ ${deliver?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })

                    return deliver
                } else {
                    throw new Error('Deliver has been created')
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async updateDelivers(_, {
            input
        }, context) {
            try {
                const findDeliver = await Delivers.findByIdAndUpdate(input.id, {
                    ...input,
                    updateAt: convertTZ(new Date())
                })

                if (findDeliver !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findDeliver.id,
                            action: "update",
                            title: `បានកែប្រែអ្នកដឹកជញ្ជូន`,
                            content: `លេខ៖ ${input.id}`,
                            user: "",
                            createAt: convertTZ(new Date())
                        }
                    })

                    return "ការកែប្រែបានជោគជ័យ"
                } else {
                    throw new Error("Can't update data")
                }

            } catch (err) {
                throw new Error(err)
            }
        },
        async deleteDelivers(_, {
            input
        }, context) {
            try {
                const findDeliver = await Delivers.findByIdAndDelete(input.id)

                if (findDeliver !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findDeliver.id,
                            action: "delete",
                            title: `បានលុបអ្នកដឹកជញ្ជូន`,
                            content: `លេខ៖ ${input.id}`,
                            user: "",
                            createAt: convertTZ(new Date())
                        }
                    })

                    return "ការលុបបានជោគជ័យ"
                } else {
                    throw new Error('Action not allowed')
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Subscription: {
        newDeliver: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['NEW_DELIVER'])
        }
    }
}

export default deliverResolvers