import moment from "moment"
import { convertQueryDate, convertTZ, getDayOfMonth, getLastMonthCode, marge2Array } from "../../../functions/fn.js"
import Products from "../../../models/pos/product.js"
import Reconciliation from "../../../models/pos/reconciliation.js"
import SaleOrder from "../../../models/pos/saleOrder.js"

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
        }
    },
    Mutation: {
        async generateInventory(_, {
            input
        }, context) {
            try {
                // console.log(convertTZ(input.date))
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

                console.log(lastRecon)

                if (lastRecon.length !== 0) {
                    await Reconciliation.findOneAndDelete({ "code": code })
                    const result = []

                    const saleOrder = await SaleOrder.aggregate([
                        { $match: { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } } },
                        { $unwind: "$products" },
                        {
                            $group: {
                                _id: "$products.product",
                                stockOutQty: { $sum: "$products.qty" },
                                stockOutPrice: { $sum: "$products.price" },
                                stockOutTotal: { $sum: "$products.total" },
                            }
                        }, {
                            $project: {
                                _id: 1,
                                stockOut: {
                                    qty: "$stockOutQty",
                                    price: { $divide: ["$stockOutTotal", "$stockOutQty"] },
                                    total: "$stockOutTotal"
                                }
                            }
                        }
                    ])

                    marge2Array(lastRecon, saleOrder)?.map(load => {
                        return result.push({
                            _id: load._id,
                            openning: {
                                qty: load.openning.qty,
                                price: load.openning.price,
                                total: load.openning.total
                            },
                            stockOut: {
                                qty: load.stockOut.qty,
                                price: load.stockOut.price,
                                total: load.stockOut.total
                            },
                            closing: {
                                qty: load.openning.qty - load.stockOut.qty,
                                price: load.openning.price - load.stockOut.price,
                                total: load.openning.total - load.stockOut.total,
                            }
                        })
                    })

                    const recon = new Reconciliation({
                        ...input,
                        code: code,
                        date: date,
                        products: result,
                        createAt: convertTZ(new Date())
                    })

                    await recon.save()
                } else {
                    await Reconciliation.findOneAndDelete({ "code": code })

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
                        { $unwind: "$product" },
                        {
                            $group: {
                                _id: "$products.product",
                                stockOutQty: { $sum: "$products.qty" },
                                stockOutPrice: { $first: "$product.price" },
                                stockOutTotal: { $sum: "$products.total" },
                            }
                        }, {
                            $project: {
                                _id: 1,
                                stockOut: {
                                    qty: "$stockOutQty",
                                    price: { $divide: ["$stockOutTotal", "$stockOutQty"] },
                                    total: "$stockOutTotal"
                                },
                                closing: {
                                    qty: { $subtract: [0, "$stockOutQty"] },
                                    // price: { $subtract: [0, { $divide: ["$stockOutTotal", "$stockOutQty"] }] },
                                    price: "$stockOutPrice",
                                    total: { $subtract: [0, "$stockOutTotal"] }
                                }
                            }
                        }
                    ])

                    console.log(saleOrder)

                    const recon = new Reconciliation({
                        ...input,
                        code: code,
                        date: date,
                        products: saleOrder,
                        createAt: convertTZ(new Date())
                    })

                    await recon.save()
                }

                return "ដំណើរការបានជោគជ័យ។"
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Subscription: {

    }
}

export default reconciliationResolvers