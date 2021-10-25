import { AuthenticationError } from "apollo-server-errors"
import { convertTZ } from "../../../functions/fn.js"
import Customers from "../../../models/pos/customer.js"

const customerResolvers = {
    Query: {
        async getCustomers() {
            try {
                const customers = await Customers.find().sort({ createdAt: -1 })

                return {
                    data: customers,
                    message: "ការបញ្ចូលបានជោគជ័យ"
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
                const reg = new RegExp(input.lname)
                const reg1 = new RegExp(input.fname)
                const findCustomer = await Customers.find({ $and: [
                    {"lname": reg},
                    {"fname": reg1},
                ] })

                if (findCustomer?.length === 0) {
                    const newCustomer = new Customers({
                        ...input,
                        createAt: convertTZ(new Date())
                    })

                    const customer = await newCustomer.save()

                    context.pubsub.publish('NEW_CUSTOMER', {
                        newCustomer: customer
                    })

                    return customer
                } else {
                    throw new AuthenticationError('Action not allowed')
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async updateCustomers(_, {
            input
        }, context) {
            try {
                const findProduct = await Customers.findByIdAndUpdate(input.id, {
                    ...input,
                    updateAt: convertTZ(new Date())
                })

                if (findProduct !== null) {
                    return "ការកែប្រែបានជោគជ័យ"
                } else {
                    throw new AuthenticationError('Action not allowed')
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
                    return "ការលុបបានជោគជ័យ"
                } else {
                    throw new AuthenticationError('Action not allowed')
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