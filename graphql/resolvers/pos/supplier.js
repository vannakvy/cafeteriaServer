import { AuthenticationError } from "apollo-server-errors"
import { convertTZ } from "../../../functions/fn.js"
import Suppliers from "../../../models/pos/supplier.js"
import mongoose from 'mongoose'

const supplierResolvers = {
    Query: {
        async getSuppliers(_, {
            input
        }, context) {
            try {
                const reg = new RegExp(input?.keyword)
                let suppliers = []
                if (input?.keyword === null || input?.keyword === "") {
                    suppliers = await Suppliers.find().sort({ createAt: -1 }).skip((input?.current - 1) * input?.limit).limit(input?.limit)
                } else {
                    if (mongoose.Types.ObjectId.isValid(input?.keyword)) {
                        suppliers = await Suppliers.find({
                            $or: [
                                { "_id": mongoose.Types.ObjectId(input?.keyword) }
                            ]
                        }).sort({ createAt: -1 }).skip((input?.current - 1) * input?.limit).limit(input?.limit)
                    } else {
                        suppliers = await Suppliers.find({
                            $or: [
                                { "companyName": reg },
                                { "lname": reg },
                                { "fname": reg }
                            ]
                        }).sort({ createAt: -1 }).skip((input?.current - 1) * input?.limit).limit(input?.limit)
                    }
                }

                const pageCount = await Suppliers.countDocuments()

                return {
                    data: suppliers,
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
        async getSuppliersRangeDate(_, {
            input
        }, context) {
            try {
                const suppliers = await Suppliers.find(
                    { "createAt": { "$gte": convertQueryDate(input.startDate), "$lte": convertQueryDate(input.endDate) } }
                ).sort({ createdAt: -1 })

                return {
                    data: suppliers,
                    message: "ការបញ្ចូលបានជោគជ័យ"
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Mutation: {
        async setSuppliers(_, {
            input
        }, context) {
            try {
                const findSupplier = await Suppliers.find({
                    $and: [
                        { "companyName": input.companyName },
                        { "lname": input.lname },
                        { "fname": input.fname },
                        { "tel": input.tel },
                    ]
                })

                if (findSupplier?.length === 0) {
                    const newSupplier = new Suppliers({
                        ...input,
                        createAt: convertTZ(new Date())
                    })

                    const supplier = await newSupplier.save()

                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: supplier?.id,
                            action: "create",
                            title: `បានបង្កើតអ្នកផ្គត់ផ្គង់`,
                            content: `លេខ៖ ${supplier?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })

                    return supplier
                } else {
                    throw new Error('Supplier has been created')
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async updateSuppliers(_, {
            input
        }, context) {
            try {
                const findSupplier = await Suppliers.findByIdAndUpdate(input.id, {
                    ...input,
                    updateAt: convertTZ(new Date())
                })

                if (findSupplier !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findSupplier.id,
                            action: "update",
                            title: `បានកែប្រែអ្នកផ្គត់ផ្គង់`,
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
        async deleteSuppliers(_, {
            input
        }, context) {
            try {
                const findSupplier = await Suppliers.findByIdAndDelete(input.id)

                if (findSupplier !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findSupplier.id,
                            action: "delete",
                            title: `បានលុបអ្នកផ្គត់ផ្គង់`,
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
        newSupplier: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['NEW_SUPPLIER'])
        }
    }
}

export default supplierResolvers