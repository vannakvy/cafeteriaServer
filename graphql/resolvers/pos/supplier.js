import { AuthenticationError } from "apollo-server-errors"
import { convertTZ } from "../../../functions/fn.js"
import Suppliers from "../../../models/pos/supplier.js"

const supplierResolvers = {
    Query: {
        async getSuppliers() {
            try {
                const suppliers = await Suppliers.find().sort({ createdAt: -1 })

                return {
                    data: suppliers,
                    message: "ការបញ្ចូលបានជោគជ័យ"
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
                const reg = new RegExp(input.name)
                const findSupplier = await Suppliers.find({ $and: [
                    {"name": reg},
                ] })

                if (findSupplier?.length === 0) {
                    const newSupplier = new Suppliers({
                        ...input,
                        createAt: convertTZ(new Date())
                    })

                    const supplier = await newSupplier.save()

                    context.pubsub.publish('NEW_SUPPLIER', {
                        newSupplier: supplier
                    })

                    return supplier
                } else {
                    throw new AuthenticationError('Action not allowed')
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async updateSuppliers(_, {
            input
        }, context) {
            try {
                const findProduct = await Suppliers.findByIdAndUpdate(input.id, {
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
        async deleteSuppliers(_, {
            input
        }, context) {
            try {
                const findSupplier = await Suppliers.findByIdAndDelete(input.id)

                if (findSupplier !== null) {
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
        newSupplier: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['NEW_SUPPLIER'])
        }
    }
}

export default supplierResolvers