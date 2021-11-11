import { AuthenticationError } from "apollo-server-errors"
import { convertTZ } from "../../../functions/fn.js"
import PurchaseOrders from "../../../models/pos/purchaseOrder.js"

const purchaseOrderResolvers = {
    Query: {
        async getPurchaseOrders() {
            try {
                const purchaseOrder = await PurchaseOrders.find().sort({ createdAt: -1 }).populate({
                    path: "products",
                    populate: "product"
                })

                return {
                    data: purchaseOrder,
                    message: "ការបញ្ចូលបានជោគជ័យ"
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async getPurchaseOrdersRangeDate(_, {
            input
        }, context) {
            try {
                const purchaseOrder = await PurchaseOrders.find(
                    { "createAt": { "$gte": convertQueryDate(input.startDate), "$lte": convertQueryDate(input.endDate) } }
                ).sort({ createdAt: -1 })

                return {
                    data: purchaseOrder,
                    message: "ការបញ្ចូលបានជោគជ័យ"
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Mutation: {
        async setPurchaseOrders(_, {
            input
        }, context) {
            try {
                const newPurchaseOrder = new PurchaseOrders({
                    ...input,
                    createAt: convertTZ(new Date())
                })

                const purchaseOrder = await newPurchaseOrder.save().then(res => res.populate(["supplier", {
                    path: "products",
                    populate: "product"
                }]))

                console.log(purchaseOrder)

                context.pubsub.publish('NEW_PURCHASEORDER', {
                    newPurchaseOrder: purchaseOrder
                })

                return purchaseOrder
            } catch (err) {
                throw new Error(err)
            }
        },
        async updatePurchaseOrders(_, {
            input
        }, context) {
            try {
                const findPurchaseOrder = await PurchaseOrders.findByIdAndUpdate(input.id, {
                    ...input,
                    updateAt: convertTZ(new Date())
                })

                if (findPurchaseOrder !== null) {
                    return "ការកែប្រែបានជោគជ័យ"
                } else {
                    throw new AuthenticationError('Action not allowed')
                }

            } catch (err) {
                throw new Error(err)
            }
        },
        async deletePurchaseOrders(_, {
            input
        }, context) {
            try {
                const findPurchaseOrder = await PurchaseOrders.findByIdAndDelete(input.id)

                if (findPurchaseOrder !== null) {
                    return "ការលុបបានជោគជ័យ"
                } else {
                    throw new AuthenticationError('Action not allowed')
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async setSubPurchaseOrders(_, {
            id, input
        }, context) {
            try {
                const findPurchaseOrder = await PurchaseOrders.findOneAndUpdate(id, {
                    "$push": {
                        products: input
                    }
                })

                const findPOandSub = await PurchaseOrders.findById(id).populate({
                    path: "products",
                    populate: "product"
                })

                let subTotal = 0
                await findPOandSub?.products?.map(load => {
                    return subTotal += parseFloat(load.total)
                })

                let grandTotal = subTotal + findPOandSub?.tax - findPOandSub?.offer

                await PurchaseOrders.findByIdAndUpdate(id, {
                    subTotal: subTotal,
                    grandTotal: grandTotal
                })

                if (findPurchaseOrder !== null) {
                    return "ការកែប្រែបានជោគជ័យ"
                } else {
                    throw new AuthenticationError('Action not allowed')
                }

            } catch (err) {
                throw new Error(err)
            }
        },
        async updateSubPurchaseOrders(_, {
            input
        }, context) {
            try {
                const findPurchaseOrder = await PurchaseOrders.updateOne({ "products._id": input.id },
                    {
                        '$set': {
                            'products.$.price': input.price,
                            'products.$.qty': input.qty,
                            'products.$.total': input.total,
                        }
                    })

                const findPOandSub = await PurchaseOrders.findOne({ "products._id": input.id }).populate({
                    path: "products",
                    populate: "product"
                })

                let subTotal = 0
                await findPOandSub?.products?.map(load => {
                    return subTotal += parseFloat(load.total)
                })

                let grandTotal = subTotal + findPOandSub?.tax - findPOandSub?.offer

                await PurchaseOrders.findOneAndUpdate(findPOandSub?._id, {
                    subTotal: subTotal,
                    grandTotal: grandTotal
                })

                // const findPO = await PurchaseOrders.findById(findPOandSub?._id)

                // console.log(findPO)

                if (findPurchaseOrder !== null) {
                    return "ការកែប្រែបានជោគជ័យ"
                } else {
                    throw new AuthenticationError('Action not allowed')
                }

            } catch (err) {
                throw new Error(err)
            }
        },
        async deleteSubPurchaseOrders(_, {
            input
        }, context) {
            try {
                const findPurchaseOrder = await PurchaseOrders.findOneAndUpdate({ "products._id": input.id },
                    {
                        '$pull': {
                            "products": {
                                "_id": input.id
                            }
                        }
                    })

                const findPOandSub = await PurchaseOrders.findById(findPurchaseOrder?._id).populate({
                    path: "products",
                    populate: "product"
                })

                let subTotal = 0
                await findPOandSub?.products?.map(load => {
                    return subTotal += parseFloat(load.total)
                })

                let grandTotal = subTotal + findPOandSub?.tax - findPOandSub?.offer

                await PurchaseOrders.findByIdAndUpdate(findPurchaseOrder?._id, {
                    subTotal: subTotal,
                    grandTotal: grandTotal
                })

                if (findPurchaseOrder !== null) {
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
        newPurchaseOrder: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['NEW_PURCHASEORDER'])
        }
    }
}

export default purchaseOrderResolvers