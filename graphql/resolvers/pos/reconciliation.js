import moment from "moment"
import { convertQueryDate, convertTZ, getDayOfMonth, getLastMonthCode, marge2Array } from "../../../functions/fn.js"
import Products from "../../../models/pos/product.js"
import PurchaseOrders from "../../../models/pos/purchaseOrder.js"
import Reconciliation from "../../../models/pos/reconciliation.js"
import SaleOrder from "../../../models/pos/saleOrder.js"
import mongoose from 'mongoose'

const reconciliationResolvers = {
    Query: {
        async phsicalInventory(_, {
            input
        }, context) {
            try {
                let recon = []
                if (!input?.id) {
                    recon = await Reconciliation.find().skip((input?.current - 1) * input?.limit).limit(input?.limit).sort({ createAt: -1 })
                } else {
                    recon = await Reconciliation.find({ "code": input?.id }).skip((input?.current - 1) * input?.limit).limit(input?.limit).sort({ createAt: -1 })
                }

                console.log(recon)

                return recon
            } catch (err) {
                throw new Error(err)
            }
        },
        async getInventory(_, {
            input
        }, context){
            try {
                let reg = new RegExp(input?.keyword)
                const recon = await Reconciliation.find({
                    code: reg
                }).sort({ createAt: -1})

                return recon
                
            } catch (error) {
                throw new Error(error)
            }
        }
    },
    Mutation: {
        async generateInventory(_, {
            input
        }, context) {
            try {
                let code = moment(convertTZ(input.date)).format("MMM-YYYY")
                let lastCode = getLastMonthCode(convertTZ(input.date))
                let date = convertTZ(input.date)
                let startDate = getDayOfMonth(convertTZ(input.date)).startDate
                let endDate = getDayOfMonth(convertTZ(input.date)).endDate

                const lastRecon = await Reconciliation.aggregate([
                    { $match: { "code": lastCode } },
                    { $unwind: "$products" },
                    {
                        $group: {
                            _id: "$products._id",
                            openningQty: { $first: "$products.closing.qty" },
                            openningPrice: { $first: "$products.closing.price" },
                            openningTotal: { $first: "$products.closing.total" },
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            openning: {
                                qty: "$openningQty",
                                price: "$openningPrice",
                                total: "$openningTotal"
                            }
                        }
                    }
                ])

                if (lastRecon.length !== 0) {
                    await Reconciliation.findOneAndDelete({ "code": code })

                    const purchaseOrder = await PurchaseOrders.aggregate([
                        { $match: { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } } },
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'products.product',
                                foreignField: '_id',
                                as: 'product'
                            }
                        },
                        { $unwind: "$products" },
                        // { $unwind: "$product" },
                        {
                            $group: {
                                _id: "$products.product",
                                stockInQty: { $sum: "$products.qty" },
                                stockInTotal: { $sum: "$products.total" },
                            }
                        }, {
                            $project: {
                                _id: 1,
                                stockIn: {
                                    qty: "$stockInQty",
                                    price: { $divide: ["$stockInTotal", "$stockInQty"] },
                                    total: "$stockInTotal"
                                }
                            }
                        }
                    ])

                    const saleOrder = await SaleOrder.aggregate([
                        { $match: { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } } },
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'products.product',
                                foreignField: '_id',
                                as: 'product'
                            }
                        },
                        { $unwind: "$products" },
                        // { $unwind: "$product" },
                        {
                            $group: {
                                _id: "$products.product",
                                stockOutQty: { $sum: "$products.qty" },
                            }
                        }, {
                            $project: {
                                _id: 1,
                                stockOut: {
                                    qty: "$stockOutQty",
                                }
                            }
                        }
                    ])

                    const finalResult = []
                    marge2Array(marge2Array(purchaseOrder, saleOrder, 1), lastRecon, 1).map(load => {
                        const qty = parseFloat(load?.stockIn?.qty ? load?.stockIn?.qty : 0) + parseFloat(load?.openning?.qty ? load?.openning?.qty : 0)
                        const total = parseFloat(load?.stockIn?.total ? load?.stockIn?.total : 0) + parseFloat(load?.openning?.total ? load?.openning?.total : 0)
                        const price = total / qty
                        finalResult.push({
                            ...load,
                            stockOut: {
                                qty: load?.stockOut?.qty ? load?.stockOut?.qty : 0,
                                price: price,
                                total: parseFloat(load?.stockOut?.qty ? load?.stockOut?.qty : 0) * price
                            }
                        })
                    })

                    const lastFinalResult = []
                    finalResult.map(load => {
                        const qty = parseFloat(load?.stockIn?.qty ? load?.stockIn?.qty : 0) + parseFloat(load?.openning?.qty ? load?.openning?.qty : 0)
                        const total = parseFloat(load?.stockIn?.total ? load?.stockIn?.total : 0) + parseFloat(load?.openning?.total ? load?.openning?.total : 0)
                        const price = total / qty
                        lastFinalResult.push({
                            ...load,
                            closing: {
                                qty: parseFloat(qty) - parseFloat(load?.stockOut?.qty ? load?.stockOut?.qty : 0),
                                price: price,
                                total: (parseFloat(qty) - parseFloat(load?.stockOut?.qty ? load?.stockOut?.qty : 0)) * price
                            }
                        })
                    })

                    const recon = new Reconciliation({
                        ...input,
                        code: code,
                        date: date,
                        products: lastFinalResult,
                        createAt: convertTZ(new Date())
                    })

                    await recon.save()
                } else {
                    await Reconciliation.findOneAndDelete({ "code": code })

                    const purchaseOrder = await PurchaseOrders.aggregate([
                        { $match: { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } } },
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'products.product',
                                foreignField: '_id',
                                as: 'product'
                            }
                        },
                        { $unwind: "$products" },
                        // { $unwind: "$product" },
                        {
                            $group: {
                                _id: "$products.product",
                                stockInQty: { $sum: "$products.qty" },
                                stockInTotal: { $sum: "$products.total" },
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                stockIn: {
                                    qty: "$stockInQty",
                                    price: { $divide: ["$stockInTotal", "$stockInQty"] },
                                    total: "$stockInTotal"
                                }
                            }
                        }
                    ])

                    const saleOrder = await SaleOrder.aggregate([
                        { $match: { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } } },
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'products.product',
                                foreignField: '_id',
                                as: 'product'
                            }
                        },
                        { $unwind: "$products" },
                        // { $unwind: "$product" },
                        {
                            $group: {
                                _id: "$products.product",
                                stockOutQty: { $sum: "$products.qty" },
                            }
                        }, {
                            $project: {
                                _id: 1,
                                stockOut: {
                                    qty: "$stockOutQty",
                                }
                            }
                        }
                    ])

                    const finalResult = []
                    marge2Array(purchaseOrder, saleOrder, 1).map(load => {
                        const qty = load?.stockOut?.qty !== undefined ? load.stockOut.qty : 0
                        const price = load?.stockIn?.price !== undefined ? load.stockIn.price : 0
                        finalResult.push({
                            ...load,
                            stockOut: {
                                qty: qty,
                                price: price,
                                total: qty * price
                            }
                        })
                    })

                    const lastFinalResult = []
                    finalResult.map(load => {
                        const qty = load?.stockIn?.qty - load?.stockOut?.qty
                        const price = load?.stockIn?.price
                        lastFinalResult.push({
                            ...load,
                            closing: {
                                qty: qty,
                                price: price,
                                total: qty * price,
                            }
                        })
                    })

                    const recon = new Reconciliation({
                        ...input,
                        code: code,
                        date: date,
                        products: lastFinalResult,
                        createAt: convertTZ(new Date())
                    })

                    await recon.save()
                }

                return "ដំណើរការបានជោគជ័យ។"
            } catch (err) {
                throw new Error(err)
            }
        },
        async generateAccounting(_, {
            input
        }, context) {
            try {
                const findRecon = await Reconciliation.findById(input.id)

                let lastCode = getLastMonthCode(convertTZ(findRecon.date))
                let startDate = getDayOfMonth(convertTZ(findRecon.date)).startDate
                let endDate = getDayOfMonth(convertTZ(findRecon.date)).endDate

                const lastRecon = await Reconciliation.findOne({
                    code: lastCode
                }).select("accounting")

                if (lastRecon !== null) {
                    const incPaidAmount = await SaleOrder.aggregate([
                        {
                            $match: {
                                $and: [
                                    { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } },
                                    { $expr: { $gte: ["$payment", "$grandTotal"] } }
                                ]
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                amount: "$payment"
                            }
                        }
                    ])

                    const incNonPaidAmount = await SaleOrder.aggregate([
                        {
                            $match: {
                                $and: [
                                    { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } },
                                    { $expr: { $lt: ["$payment", "$grandTotal"] } }
                                ]
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                amount: { $subtract: ["$grandTotal", "$payment"] }
                            }
                        }
                    ])


                    const sumIncNonPaid = incNonPaidAmount.reduce((sum, { amount }) => sum + amount, 0)
                    const sumIncPaid = incPaidAmount.reduce((sum, { amount }) => sum + amount, 0)

                    const expPaidAmount = await PurchaseOrders.aggregate([
                        {
                            $match: {
                                $and: [
                                    { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } },
                                    { $expr: { $gte: ["$payment", "$grandTotal"] } }
                                ]
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                amount: "$payment"
                            }
                        }
                    ])

                    const expNonPaidAmount = await PurchaseOrders.aggregate([
                        {
                            $match: {
                                $and: [
                                    { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } },
                                    { $expr: { $lt: ["$payment", "$grandTotal"] } }
                                ]
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                amount: { $subtract: ["$grandTotal", "$payment"] }
                            }
                        }
                    ])


                    const sumExpNonPaid = expNonPaidAmount.reduce((sum, { amount }) => sum + amount, 0)
                    const sumExpPaid = expPaidAmount.reduce((sum, { amount }) => sum + amount, 0)

                    const updateRecon = await Reconciliation.updateOne({
                        _id: mongoose.Types.ObjectId(input.id)
                    },
                        {
                            "accounting.openning": {
                                paid: lastRecon.accounting.closing.paid,
                                nonPaid: lastRecon.accounting.closing.nonPaid,
                            },
                            "accounting.income": {
                                paid: sumIncPaid,
                                nonPaid: sumIncNonPaid
                            },
                            "accounting.expense": {
                                paid: sumExpPaid,
                                nonPaid: sumExpNonPaid
                            },
                            "accounting.closing": {
                                paid: (parseFloat(sumExpPaid) + parseFloat(lastRecon.accounting.closing.paid)) - parseFloat(sumIncPaid),
                                nonPaid: (parseFloat(sumExpNonPaid) + parseFloat(lastRecon.accounting.closing.nonPaid)) - parseFloat(sumIncNonPaid)
                            },
                        })

                    if (updateRecon) {
                        return "បញ្ចូលបានជោគជ័យ"
                    }
                } else {
                    const incPaidAmount = await SaleOrder.aggregate([
                        {
                            $match: {
                                $and: [
                                    { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } },
                                    { $expr: { $gte: ["$payment", "$grandTotal"] } }
                                ]
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                amount: "$payment"
                            }
                        }
                    ])

                    const incNonPaidAmount = await SaleOrder.aggregate([
                        {
                            $match: {
                                $and: [
                                    { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } },
                                    { $expr: { $lt: ["$payment", "$grandTotal"] } }
                                ]
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                amount: { $subtract: ["$grandTotal", "$payment"] }
                            }
                        }
                    ])


                    const sumIncNonPaid = incNonPaidAmount.reduce((sum, { amount }) => sum + amount, 0)
                    const sumIncPaid = incPaidAmount.reduce((sum, { amount }) => sum + amount, 0)

                    const expPaidAmount = await PurchaseOrders.aggregate([
                        {
                            $match: {
                                $and: [
                                    { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } },
                                    { $expr: { $gte: ["$payment", "$grandTotal"] } }
                                ]
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                amount: "$payment"
                            }
                        }
                    ])

                    const expNonPaidAmount = await PurchaseOrders.aggregate([
                        {
                            $match: {
                                $and: [
                                    { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } },
                                    { $expr: { $lt: ["$payment", "$grandTotal"] } }
                                ]
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                amount: { $subtract: ["$grandTotal", "$payment"] }
                            }
                        }
                    ])


                    const sumExpNonPaid = expNonPaidAmount.reduce((sum, { amount }) => sum + amount, 0)
                    const sumExpPaid = expPaidAmount.reduce((sum, { amount }) => sum + amount, 0)

                    const updateRecon = await Reconciliation.updateOne({
                        _id: mongoose.Types.ObjectId(input.id)
                    },
                        {
                            "accounting.openning": {
                                paid: 0,
                                nonPaid: 0
                            },
                            "accounting.income": {
                                paid: sumIncPaid,
                                nonPaid: sumIncNonPaid
                            },
                            "accounting.expense": {
                                paid: sumExpPaid,
                                nonPaid: sumExpNonPaid
                            },
                            "accounting.closing": {
                                paid: parseFloat(sumExpPaid) - parseFloat(sumIncPaid),
                                nonPaid: parseFloat(sumExpNonPaid) - parseFloat(sumIncNonPaid)
                            },
                        })

                    if (updateRecon) {
                        return "បញ្ចូលបានជោគជ័យ"
                    }
                }
                // console.log(updateRecon)
            } catch (error) {
                throw new Error(error)
            }
        }
    },
    Subscription: {

    }
}

export default reconciliationResolvers