import { AuthenticationError } from "apollo-server-errors"
import { convertTZ } from "../../../functions/fn.js"
import Delivers from "../../../models/pos/deliver.js"

const deliverResolvers = {
    Query: {
        async getDelivers() {
            try {
                const delivers = await Delivers.find().sort({ createdAt: -1 })

                return {
                    data: delivers,
                    message: "ការបញ្ចូលបានជោគជ័យ"
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
                const reg = new RegExp(input.lname)
                const reg1 = new RegExp(input.fname)
                const findDeliver = await Delivers.find({ $and: [
                    {"lname": reg},
                    {"fname": reg1},
                ] })

                if (findDeliver?.length === 0) {
                    const newDeliver = new Delivers({
                        ...input,
                        createAt: convertTZ(new Date())
                    })

                    const deliver = await newDeliver.save()

                    context.pubsub.publish('NEW_DELIVER', {
                        newDeliver: deliver
                    })

                    return deliver
                } else {
                    throw new AuthenticationError('Action not allowed')
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async updateDelivers(_, {
            input
        }, context) {
            try {
                const findProduct = await Delivers.findByIdAndUpdate(input.id, {
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
        async deleteDelivers(_, {
            input
        }, context) {
            try {
                const findDeliver = await Delivers.findByIdAndDelete(input.id)

                if (findDeliver !== null) {
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
        newDeliver: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['NEW_DELIVER'])
        }
    }
}

export default deliverResolvers