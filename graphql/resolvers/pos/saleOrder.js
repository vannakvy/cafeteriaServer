import { AuthenticationError } from "apollo-server-errors"
import { convertTZ, PushSingleNotification } from "../../../functions/fn.js"
import SaleOrders from "../../../models/pos/saleOrder.js"
import mongoose from 'mongoose'
import moment from "moment"
import Products from "../../../models/pos/product.js"

const saleOrderResolvers = {
    // SaleOrder: {
    //     productCount: (parent) => console.log(parent)
    // },
    Query: {
        async getSaleOrders(_, {
            input
        }, context) {
            try {
                // const reg = new RegExp(input?.keyword)
                let saleOrders = []
                if (input?.keyword === null || input?.keyword === "") {
                    saleOrders = await SaleOrders.find().skip((input?.current - 1) * input?.limit).limit(input?.limit).populate([
                        {
                            path: "customer",
                            populate: "id"
                        },
                        {
                            path: "deliver",
                            populate: "id"
                        },
                        {
                            path: "products",
                            populate: "product"
                        }
                    ]).sort({ createAt: -1 })

                } else {
                    if (mongoose.Types.ObjectId.isValid(input?.keyword)) {
                        saleOrders = await SaleOrders.find({
                            $or: [
                                { "_id": mongoose.Types.ObjectId(input?.keyword) }
                            ]
                        }).sort({ createAt: -1 }).skip((input?.current - 1) * input?.limit).limit(input?.limit).populate([
                            {
                                path: "customer",
                                populate: "id"
                            },
                            {
                                path: "deliver",
                                populate: "id"
                            },
                            {
                                path: "products",
                                populate: "product"
                            }
                        ]).sort({ createAt: -1 })
                    }
                }

                const pageCount = await SaleOrders.countDocuments()

                return {
                    data: saleOrders,
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
        async getSaleOrdersRangeDate(_, {
            input
        }, context) {
            try {
                const saleOrder = await SaleOrders.find(
                    { "createAt": { "$gte": convertQueryDate(input.startDate), "$lte": convertQueryDate(input.endDate) } }
                ).sort({ createdAt: -1 })

                return {
                    data: saleOrder,
                    message: "ការបញ្ចូលបានជោគជ័យ"
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async getSaleOrderById(_, {
            input
        }, context) {
            try {
                const saleOrder = await SaleOrders.findById(input.id).populate([
                    {
                        path: "customer",
                        populate: "id"
                    },
                    {
                        path: "deliver",
                        populate: "id"
                    },
                    {
                        path: "products",
                        populate: "product"
                    }
                ])

                // console.log(saleOrder)

                return saleOrder
            } catch (err) {
                throw new Error(err)
            }
        },
        async getSaleOrdersByCustomerId(_, {
            input
        }, context) {
            try {
                // const reg = new RegExp(input?.keyword)
                let saleOrders = []

                saleOrders = await SaleOrders.find({
                    "customer.id": mongoose.Types.ObjectId(input?.id)
                }).skip((input?.current - 1) * input?.limit).limit(input?.limit).populate({
                    path: "products",
                    populate: "product"
                }).populate("customer.id").sort({ createAt: -1 })

                const pageCount = await SaleOrders.countDocuments()

                return {
                    data: saleOrders,
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
        async getSaleOrdersBadgeByCustomerId(_, {
            input
        }, context) {
            try {
                let saleOrders = await SaleOrders.find({
                    "$and": [
                        { "customer.id": mongoose.Types.ObjectId(input?.id) },
                        { "status.isPaid": false }
                    ]
                }).countDocuments()

                return saleOrders
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Mutation: {
        async setSaleOrders(_, {
            input
        }, context) {
            try {
                // console.log(input)
                const newSaleOrder = new SaleOrders({
                    ...input,
                    createAt: convertTZ(new Date())
                })

                const saleOrder = await newSaleOrder.save().then(res => res.populate([{
                    path: "customer",
                    populate: "id"
                }, {
                    path: "deliver",
                    populate: "id"
                }, {
                    path: "products",
                    populate: "product"
                }]))

                // console.log(saleOrder)

                // start update product stockOut
                await saleOrder?.products?.map(async load => {
                    return await Products.findOneAndUpdate(
                        { "_id": load.product.id },
                        { $inc: { 'inStock': 0 - load.qty } }
                    )
                })
                // end update product stockOut

                if (saleOrder !== null) {
                    context.pubsub.publish('NEW_SALEORDER', {
                        newSaleOrder: saleOrder
                    })

                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: saleOrder?.id,
                            action: "create",
                            title: `បានបង្កើតការកម្ម៉ង`,
                            content: `លេខ៖ ${saleOrder?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })
                }
                
                return saleOrder
            } catch (err) {
                throw new Error(err)
            }
        },
        async updateSaleOrders(_, {
            input
        }, context) {
            try {
                // console.log(input)
                const findSaleOrder = await SaleOrders.findByIdAndUpdate(input.id, {
                    ...input,
                    updateAt: convertTZ(new Date())
                })

                const findPOandSub = await SaleOrders.findOne({ "_id": input.id }).populate({
                    path: "products",
                    populate: "product"
                })

                let subTotal = 0
                await findPOandSub?.products?.map(load => {
                    return subTotal += parseFloat(load.total)
                })

                let grandTotal = subTotal + findPOandSub?.tax - findPOandSub?.offer

                await SaleOrders.findByIdAndUpdate(input.id, {
                    subTotal: subTotal,
                    grandTotal: grandTotal
                })

                if (findSaleOrder !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findSaleOrder?.id,
                            action: "update",
                            title: `បានកែប្រែការកម្ម៉ង`,
                            content: `លេខ៖ ${findSaleOrder?.id}`,
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
        async deleteSaleOrders(_, {
            input
        }, context) {
            try {
                const findSaleOrder = await SaleOrders.findByIdAndDelete(input.id)

                // start update product stockIn
                await findSaleOrder?.products?.map(async load => {
                    return await Products.findOneAndUpdate(
                        { "_id": load.product },
                        { $inc: { 'inStock': load.qty } }
                    )
                })
                // end update product stockIn

                if (findSaleOrder !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findSaleOrder?.id,
                            action: "delete",
                            title: `បានលុបការកម្ម៉ង`,
                            content: `លេខ៖ ${findSaleOrder?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })

                    return "ការលុបបានជោគជ័យ"
                } else {
                    throw new Error('SaleOrder no found')
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async setSubSaleOrders(_, {
            input
        }, context) {
            try {
                const findProductInSale = await SaleOrders.findOne({
                    $and: [
                        { "_id": input.orderId },
                        { "products.product": input?.id }
                    ]
                }).select("products.$")

                // console.log(findProductInSale)

                if (findProductInSale) {
                    await SaleOrders.updateOne({
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
                    await SaleOrders.findOneAndUpdate({ "_id": input.orderId }, {
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
                    { $inc: { 'inStock': 0 - input?.qty } }
                )
                // end update product stockOut

                const findPOandSub = await SaleOrders.findOne({ "_id": input.orderId }).populate({
                    path: "products",
                    populate: "product"
                })

                let subTotal = 0
                await findPOandSub?.products?.map(load => {
                    return subTotal += parseFloat(load.total)
                })

                let grandTotal = subTotal + findPOandSub?.tax - findPOandSub?.offer

                const findSaleOrder = await SaleOrders.findByIdAndUpdate(input.orderId, {
                    subTotal: subTotal,
                    grandTotal: grandTotal
                })

                if (findSaleOrder !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findSaleOrder?.id,
                            action: "delete",
                            title: `បានបន្ថែមទំនិញក្នុងការកម្ម៉ង`,
                            content: `លេខ៖ ${findSaleOrder?.id}`,
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
        async updateSubSaleOrders(_, {
            input
        }, context) {
            try {
                // start update product stockIn
                const findSubSaleOrderIn = await SaleOrders.findOne({ "products._id": input.id }).select("products.$")

                const productIn = findSubSaleOrderIn?.products[0]
                await Products.findOneAndUpdate(
                    { "_id": productIn.product },
                    { $inc: { 'inStock': productIn.qty } }
                )
                // end update product stockIn

                const findSaleOrder = await SaleOrders.updateOne({ "products._id": input?.id },
                    {
                        '$set': {
                            'products.$.price': input.price,
                            'products.$.qty': input.qty,
                            'products.$.total': input.total,
                        }
                    }).select("products.$")

                // start update product stockOut
                const findSubSaleOrderOut = await SaleOrders.findOne({ "products._id": input.id }).select("products.$")

                const productOut = findSubSaleOrderOut?.products[0]
                await Products.findOneAndUpdate(
                    { "_id": productOut.product },
                    { $inc: { 'inStock': 0 - productOut.qty } }
                )
                // end update product stockOut

                const findPOandSub = await SaleOrders.findOne({ "products._id": input?.id }).populate(["customer", "deliver", {
                    path: "products",
                    populate: "product"
                }])

                let subTotal = 0
                await findPOandSub?.products?.map(load => {
                    return subTotal += parseFloat(load.total)
                })

                let grandTotal = subTotal + findPOandSub?.tax - findPOandSub?.offer

                await SaleOrders.findOneAndUpdate(findPOandSub?._id, {
                    subTotal: subTotal,
                    grandTotal: grandTotal
                })

                // const findPO = await SaleOrders.findById(findPOandSub?._id)

                // console.log(findPO)

                if (findSaleOrder !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findSaleOrder?.id,
                            action: "delete",
                            title: `បានកែប្រែទំនិញក្នុងការកម្ម៉ង`,
                            content: `លេខ៖ ${findSaleOrder?.id}`,
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
        async deleteSubSaleOrders(_, {
            input
        }, context) {
            try {
                // console.log(input)

                // start update product stockIn
                const findSubSaleOrderIn = await SaleOrders.findOne({ "products._id": input.id }).select("products.$")

                const productIn = findSubSaleOrderIn?.products[0]
                await Products.findOneAndUpdate(
                    { "_id": productIn.product },
                    { $inc: { 'inStock': productIn.qty } }
                )
                // end update product stockIn

                const findSaleOrder = await SaleOrders.findOneAndUpdate({ "products._id": input.id },
                    {
                        '$pull': {
                            "products": {
                                "_id": input.id
                            }
                        }
                    })



                const findPOandSub = await SaleOrders.findById(findSaleOrder?._id).populate({
                    path: "products",
                    populate: "product"
                })

                let subTotal = 0
                await findPOandSub?.products?.map(load => {
                    return subTotal += parseFloat(load.total)
                })

                let grandTotal = subTotal + findPOandSub?.tax - findPOandSub?.offer

                await SaleOrders.findByIdAndUpdate(findSaleOrder?._id, {
                    subTotal: subTotal,
                    grandTotal: grandTotal
                })

                if (findSaleOrder !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findSaleOrder?.id,
                            action: "delete",
                            title: `បានលុបទំនិញក្នុងការកម្ម៉ង`,
                            content: `លេខ៖ ${findSaleOrder?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })

                    return "ការលុបបានជោគជ័យ"
                } else {
                    throw new Error('SaleOrder no found')
                }

            } catch (err) {
                throw new Error(err)
            }
        },
        async updateOrderStatus(_, {
            input
        }, context) {
            try {
                await SaleOrders.findByIdAndUpdate(input.id, {
                    status: input
                })

                const findSaleOrder = await SaleOrders.findById(input.id).populate('customer.id')

                // console.log(findSaleOrder)

                if (findSaleOrder !== null) {
                    context.pubsub.publish('UPDATE_STATUS', {
                        updateStatus: input
                    })

                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findSaleOrder?.id,
                            action: "update",
                            title: `បានកែប្រែស្ថានភាព`,
                            content: `លេខ៖ ${findSaleOrder?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })

                    let message = ""
                    if (input.isPrepared && !input.isCooked && !input.isDelivered && !input.isPaid && !input.isCanceled) {
                        message = "ការកម៉្មងបានទទួល"
                    } else if (input.isPrepared && input.isCooked && !input.isDelivered && !input.isPaid && !input.isCanceled) {
                        message = "ការរៀបចំរួចរាល់"
                    } else if (input.isPrepared && input.isCooked && input.isDelivered && !input.isPaid && !input.isCanceled) {
                        message = "បានដឹកជញ្ជូនដល់ទីតាំង"
                    } else if (input.isPaid) {
                        message = "បានទូទាត់រួចរាល់"
                    } else if (input.isCanceled) {
                        message = "ការកម៉្មងបានបញ្ឈប់"
                    }

                    PushSingleNotification({
                        "to": findSaleOrder?.customer?.id?.token,
                        "sound": "default",
                        "title": `${message}`,
                        "body": `វិក័យបត្រលេខ៖ ${findSaleOrder?.id}`
                    })

                    return findSaleOrder.status
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Subscription: {
        newSaleOrder: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['NEW_SALEORDER'])
        },
        updateStatus: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['UPDATE_STATUS'])
        }
    }
}

export default saleOrderResolvers