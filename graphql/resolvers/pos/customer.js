import { convertTZ } from "../../../functions/fn.js"
import Customers from "../../../models/pos/customer.js"
import mongoose from 'mongoose'

const customerResolvers = {
    Query: {
        async getCustomers(_, {
            input
        }, context) {
            try {
                const reg = new RegExp(input?.keyword)
                let customers = []
                if (input?.keyword === null || input?.keyword === "") {
                    customers = await Customers.find().sort({ createAt: -1 }).skip((input?.current - 1) * input?.limit).limit(input?.limit)
                } else {
                    if (mongoose.Types.ObjectId.isValid(input?.keyword)) {
                        customers = await Customers.find({
                            $or: [
                                { "_id": mongoose.Types.ObjectId(input?.keyword) }
                            ]
                        }).sort({ createAt: -1 }).skip((input?.current - 1) * input?.limit).limit(input?.limit)
                    } else {
                        customers = await Customers.find({
                            $or: [
                                { "lname": reg },
                                { "fname": reg }
                            ]
                        }).sort({ createAt: -1 }).skip((input?.current - 1) * input?.limit).limit(input?.limit)
                    }
                }

                const pageCount = await Customers.countDocuments()

                return {
                    data: customers,
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
        async getCustomersRangeDate(_, {
            input
        }, context) {
            try {
                const customers = await Customers.find(
                    { "createAt": { "$gte": convertQueryDate(input.startDate), "$lte": convertQueryDate(input.endDate) } }
                ).sort({ createdAt: -1 })

                return {
                    data: customers,
                    message: "ការបញ្ចូលបានជោគជ័យ"
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Mutation: {
        async setCustomers(_, {
            input
        }, context) {
            try {
                // const reg = new RegExp(input.lname)
                // const reg1 = new RegExp(input.fname)
                const findCustomer = await Customers.find({
                    $and: [
                        { "lname": input.lname },
                        { "fname": input.fname },
                        { "tel": input.tel },
                    ]
                })

                if (findCustomer?.length === 0) {
                    const newCustomer = new Customers({
                        ...input,
                        createAt: convertTZ(new Date())
                    })

                    const customer = await newCustomer.save()

                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: customer?.id,
                            action: "create",
                            title: `បានបង្កើតអតិថិជន`,
                            content: `លេខ៖ ${customer?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })

                    return customer
                } else {
                    throw new Error('Customer has been created')
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async updateCustomers(_, {
            input
        }, context) {
            try {
                const findCustomer = await Customers.findByIdAndUpdate(input.id, {
                    ...input,
                    updateAt: convertTZ(new Date())
                })

                if (findCustomer !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findCustomer.id,
                            action: "update",
                            title: `បានកែប្រែអតិថិជន`,
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
        async deleteCustomers(_, {
            input
        }, context) {
            try {
                const findCustomer = await Customers.findByIdAndDelete(input.id)

                if (findCustomer !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findCustomer.id,
                            action: "delete",
                            title: `បានលុបអតិថិជន`,
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
        newCustomer: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['NEW_CUSTOMER'])
        }
    }
}

export default customerResolvers