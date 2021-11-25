import { AuthenticationError } from "apollo-server-errors"
import { convertTZ } from "../../../functions/fn.js"
import PurchaseOrders from "../../../models/pos/purchaseOrder.js"
import Products from "../../../models/pos/product.js"
import mongoose from 'mongoose'

const purchaseOrderResolvers = {
    Query: {
        async getPurchaseOrders(_, {
            input
        }, context) {
            try {
                let purchaseOrder = []
                if (input?.keyword === null || input?.keyword === "") {
                    purchaseOrder = await PurchaseOrders.find().skip((input?.current - 1) * input?.limit).limit(input?.limit).populate(["supplier", {
                        path: "products",
                        populate: "product"
                    }]).sort({ createAt: -1 })

                } else {
                    if (mongoose.Types.ObjectId.isValid(input?.keyword)) {
                        purchaseOrder = await PurchaseOrders.find({
                            $or: [
                                { "_id": mongoose.Types.ObjectId(input?.keyword) }
                            ]
                        }).sort({ createAt: -1 }).skip((input?.current - 1) * input?.limit).limit(input?.limit).populate(["supplier", {
                            path: "products",
                            populate: "product"
                        }]).sort({ createAt: -1 })
                    }
                }
                // const purchaseOrder = await PurchaseOrders.find().sort({ createdAt: -1 }).populate(["supplier", {
                //     path: "products",
                //     populate: "product"
                // }])

                return {
                    data: purchaseOrder,
                    message: "ការបញ្ចូលបានជោគជ័យ"
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async getPurchaseOrderById(_, {
            input
        }, context){
            try {
                const purchaseOrder = await PurchaseOrders.findById(input.id).populate([
                    "supplier",
                    {
                        path: "products",
                        populate: "product"
                    }
                ])

                // console.log(saleOrder)

                return purchaseOrder
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

                // console.log(purchaseOrder)

                // start update product stockOut
                await purchaseOrder?.products?.map(async load => {
                    return await Products.findOneAndUpdate(
                        { "_id": load.product.id },
                        { $inc: { 'inStock': load.qty } }
                    )
                })
                // end update product stockOut

                if (purchaseOrder !== null) {
                    context.pubsub.publish('NEW_PURCHASEORDER', {
                        newPurchaseOrder: purchaseOrder
                    })

                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: purchaseOrder?.id,
                            action: "create",
                            title: `បានបង្កើតការបញ្ជាទិញ`,
                            content: `លេខ៖ ${purchaseOrder?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })
                }

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

                const findPOandSub = await PurchaseOrders.findOne({ "_id": input.id }).populate({
                    path: "products",
                    populate: "product"
                })

                let subTotal = 0
                await findPOandSub?.products?.map(load => {
                    return subTotal += parseFloat(load.total)
                })

                let grandTotal = subTotal + findPOandSub?.tax - findPOandSub?.offer

                await PurchaseOrders.findByIdAndUpdate(input.id, {
                    subTotal: subTotal,
                    grandTotal: grandTotal
                })

                if (findPurchaseOrder !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findPurchaseOrder?.id,
                            action: "update",
                            title: `បានកែប្រែការបញ្ជាទិញ`,
                            content: `លេខ៖ ${findPurchaseOrder?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })

                    return "ការកែប្រែបានជោគជ័យ"
                } else {
                    throw new Error('Purchase Order no found')
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

                await findPurchaseOrder?.products?.map(async load => {
                    return await Products.findOneAndUpdate(
                        { "_id": load.product },
                        { $inc: { 'inStock': 0 - load.qty } }
                    )
                })

                if (findPurchaseOrder !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findPurchaseOrder?.id,
                            action: "delete",
                            title: `បានលុបការកម្ម៉ង`,
                            content: `លេខ៖ ${findPurchaseOrder?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })

                    return "ការលុបបានជោគជ័យ"
                } else {
                    throw new Error('Purchase Order no found')
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async setSubPurchaseOrders(_, {
            input
        }, context) {
            try {

                const findProductInPO = await PurchaseOrders.findOne({
                    $and: [
                        { "_id": input.orderId },
                        { "products.product": input?.id }
                    ]
                }).select("products.$")

                // console.log(findProductInSale)

                if (findProductInPO) {
                    await PurchaseOrders.updateOne({
                        $and: [
                            { "_id": input.orderId },
                            { "products.product": input?.id }
                        ]
                    },
                        {
                            '$set': {
                                'products.$.price': input.price,
                                'products.$.qty': input.qty + findProductInSale?.products[0]?.qty,
                                'products.$.total': input.total + findProductInSale?.products[0]?.total
                            }
                        })
                } else {
                    await PurchaseOrders.findOneAndUpdate({ "_id": input.orderId }, {
                        "$push": {
                            products: {
                                product: input?.id,
                                qty: input?.qty,
                                price: input?.price,
                                total: input?.total,
                                remark: input?.remark
                            }
                        }
                    })
                }
                
                // start update product stockOut
                await Products.findOneAndUpdate(
                    { "_id": input?.id },
                    { $inc: { 'inStock': input?.qty } }
                )
                // end update product stockOut

                const findPOandSub = await PurchaseOrders.findOne({ "_id": input.orderId }).populate({
                    path: "products",
                    populate: "product"
                })

                let subTotal = 0
                await findPOandSub?.products?.map(load => {
                    return subTotal += parseFloat(load.total)
                })

                let grandTotal = subTotal + findPOandSub?.tax - findPOandSub?.offer

                const findPurchaseOrder = await PurchaseOrders.findByIdAndUpdate(input.orderId, {
                    subTotal: subTotal,
                    grandTotal: grandTotal
                })

                if (findPurchaseOrder !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findPurchaseOrder?.id,
                            action: "delete",
                            title: `បានបន្ថែមទំនិញក្នុងការបញ្ជាទិញ`,
                            content: `លេខ៖ ${findPurchaseOrder?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })

                    return "ការកែប្រែបានជោគជ័យ"
                } else {
                    throw new Error('Purchase Order no found')
                }

            } catch (err) {
                throw new Error(err)
            }
        },
        async updateSubPurchaseOrders(_, {
            input
        }, context) {
            try {
                console.log(input)
                // start update product stockOut
                const findSubPOOut = await PurchaseOrders.findOne({
                    $and: [
                        { "_id": input.orderId },
                        { "products._id": input.id }
                    ]
                }).select("products.$")

                const productOut = findSubPOOut?.products[0]
                await Products.findOneAndUpdate(
                    { "_id": productOut.product },
                    { $inc: { 'inStock': 0 - productOut.qty } }
                )
                // end update product stockOut

                const findPurchaseOrder = await PurchaseOrders.updateOne({
                    $and: [
                        { "_id": input.orderId },
                        { "products._id": input.id }
                    ]
                },
                    {
                        '$set': {
                            'products.$.price': input.price,
                            'products.$.qty': input.qty,
                            'products.$.total': input.total,
                        }
                    }).select("products.$")

                // start update product stockOut
                const findSubPOIn = await PurchaseOrders.findOne({
                    $and: [
                        { "_id": input.orderId },
                        { "products._id": input.id }
                    ]
                }).select("products.$")

                const productIn = findSubPOIn?.products[0]
                await Products.findOneAndUpdate(
                    { "_id": productIn.product },
                    { $inc: { 'inStock': productIn.qty } }
                )
                // end update product stockOut

                const findPOandSub = await PurchaseOrders.findOne({
                    $and: [
                        { "_id": input.orderId },
                        { "products._id": input.id }
                    ]
                }).populate(["supplier", {
                    path: "products",
                    populate: "product"
                }])

                let subTotal = 0
                await findPOandSub?.products?.map(load => {
                    return subTotal += parseFloat(load.total)
                })

                let grandTotal = subTotal + findPOandSub?.tax - findPOandSub?.offer

                await PurchaseOrders.findOneAndUpdate({_id: findPOandSub?._id}, {
                    subTotal: subTotal,
                    grandTotal: grandTotal
                })

                // const findPO = await SaleOrders.findById(findPOandSub?._id)

                // console.log(findPO)

                if (findPurchaseOrder !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: input?.id,
                            action: "delete",
                            title: `បានកែប្រែទំនិញក្នុងការបញ្ជាទិញ`,
                            content: `លេខ៖ ${input?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })

                    return "ការកែប្រែបានជោគជ័យ"
                } else {
                    throw new Error('SaleOrder no found')
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