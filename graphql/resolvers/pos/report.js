import { convertTZ, getDayOfMonth, convertQueryDate, marge2Array, getStartTimeOfDate, getEndTimeOfDate } from "../../../functions/fn.js"
import SaleOrder from "../../../models/pos/saleOrder.js"
import PurchaseOrders from "../../../models/pos/purchaseOrder.js"
import moment from "moment"
import Reconciliation from "../../../models/pos/reconciliation.js"

const reportResolvers = {
    Query: {

    },
    Mutation: {
        async getReportProductByDate(_, {
            input
        }, context){
            try {
                let code = moment(convertTZ(input.date)).format("MMM-YYYY")
                let startDate = getDayOfMonth(convertTZ(input.date)).startDate
                // let endDate = getDayOfMonth(convertTZ(input.date)).endDate
                let endDate = convertTZ(getEndTimeOfDate(input.date))

                
                // console.log(moment(convertQueryDate(startDate)).format("DD-MMM-YYYY HH:MM:SS A"))

                let reconReport = await Reconciliation.aggregate([
                    {
                        $match: { "code": code }
                    },
                    // {
                    //     $unwind: "$products"
                    // },
                    // {
                    //     $lookup: {
                    //         from: 'products',
                    //         localField: 'products._id',
                    //         foreignField: '_id',
                    //         as: 'product'
                    //     }
                    // },
                    // {
                    //     $project: {
                    //         _id: "$products._id" ,
                    //         description: { $first: "$product.description"},
                    //         qty: "$products.openning.qty",
                    //     }
                    // },
                    // {
                    //     $group: {
                    //         _id: "$_id",
                    //         description: { $first: "$description" },
                    //         openning: { $sum: "$qty" }
                    //     }
                    // }

                    {
                        $unwind: "$products"
                    },
                    {
                        $group: {
                            _id: "$products._id",
                            qty: {$sum: "$products.openning.qty"}
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            _id: "$_id",
                            description: {$first: "$product.description"},
                            openning: "$qty",
                        }
                    },
                ])

                let productOutReport = await SaleOrder.aggregate([
                    {
                        $match: { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } }
                    },
                    // {
                    //     $lookup: {
                    //         from: 'products',
                    //         localField: 'products.product',
                    //         foreignField: '_id',
                    //         as: 'product'
                    //     }
                    // },
                    // {
                    //     $project: {
                    //         _id: { $first: "$product._id" },
                    //         description: { $first: "$product.description" },
                    //         qty: { $first: "$products.qty" },
                    //     }
                    // },
                    // {
                    //     $group: {
                    //         _id: "$_id",
                    //         description: { $first: "$description" },
                    //         stockOut: { $sum: "$qty" }
                    //     }
                    // }
                    {
                        $unwind: "$products"
                    },
                    {
                        $group: {
                            _id: "$products.product",
                            qty: {$sum: "$products.qty"}
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            _id: "$_id",
                            description: {$first: "$product.description"},
                            stockOut: "$qty",
                        }
                    },
                ])

                let productInReport = await PurchaseOrders.aggregate([
                    {
                        $match: { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } }
                    },
                    // {
                    //     $lookup: {
                    //         from: 'products',
                    //         localField: 'products.product',
                    //         foreignField: '_id',
                    //         as: 'product'
                    //     }
                    // },
                    // {
                    //     $project: {
                    //         _id: { $first: "$product._id" },
                    //         description: { $first: "$product.description" },
                    //         qty: { $first: "$products.qty" },
                    //     }
                    // },
                    // {
                    //     $group: {
                    //         _id: "$_id",
                    //         description: { $first: "$description" },
                    //         stockIn: { $sum: "$qty" }
                    //     }
                    // }
                    {
                        $unwind: "$products"
                    },
                    {
                        $group: {
                            _id: "$products.product",
                            qty: {$sum: "$products.qty"}
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            _id: "$_id",
                            description: {$first: "$product.description"},
                            stockIn: "$qty",
                        }
                    },
                ])

                let productReport = marge2Array(marge2Array(productInReport, productOutReport, 2), reconReport, 2).reduce((acc, val, ind) => {
                    acc.push({
                        ...val,
                        totalStock: (parseFloat(val.stockIn ? val.stockIn : 0) + parseFloat(val.openning ? val.openning : 0)) - parseFloat(val.stockOut ? val.stockOut : 0)
                    })
                    return acc;
                }, [])

                return productReport


            } catch (error) {
                throw new Error(error)
            }
        },
        async getReportProductByRangeDate(_, {
            input
        }, context) {
            try {
                let startDate = convertTZ(getStartTimeOfDate(input.startDate))
                let endDate = convertTZ(getEndTimeOfDate(input.endDate))

                let productOutReport = await SaleOrder.aggregate([
                    {
                        $match: { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } }
                    },
                    // {
                    //     $lookup: {
                    //         from: 'products',
                    //         localField: 'products.product',
                    //         foreignField: '_id',
                    //         as: 'product'
                    //     }
                    // },
                    // {
                    //     $unwind: "$products"
                    // },
                    // {
                    //     $unwind: "$product"
                    // },
                    // {
                    //     $group: {
                    //         _id: "$products._id",
                    //         description: {$first:"$product.description"},
                    //         stockOut: {$first: "$products.qty"}
                    //     }
                    // }

                    {
                        $unwind: "$products"
                    },
                    {
                        $group: {
                            _id: "$products.product",
                            qty: {$sum: "$products.qty"}
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    // {
                    //     $unwind: "$product"
                    // },
                    {
                        $project: {
                            _id: "$_id",
                            description: {$first: "$product.description"},
                            stockOut: "$qty",
                        }
                    },

                    // {
                    //     $project: {  
                    //         _id: { $first: "$product._id" },
                    //         description: { $first: "$product.description" },
                    //         qty: { $first: "$products.qty" },
                    //     }
                    // },
                    // {
                    //     $group: {
                    //         _id: "$_id",
                    //         description: { $first: "$description" },
                    //         stockOut: { $sum: "$qty" }
                    //     }
                    // }
                ])

                let productInReport = await PurchaseOrders.aggregate([
                    {
                        $match: { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } }
                    },
                    {
                        $unwind: "$products"
                    },
                    {
                        $group: {
                            _id: "$products.product",
                            qty: {$sum: "$products.qty"}
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    // {
                    //     $unwind: "$product"
                    // },
                    {
                        $project: {
                            _id: "$_id",
                            description: {$first: "$product.description"},
                            stockIn: "$qty",
                        }
                    },
                    // {
                    //     $group: {
                    //         _id: "$_id",
                    //         description: { $first: "$description" },
                    //         stockIn: { $sum: "$qty" }
                    //     }
                    // }
                ])

                console.log(productOutReport)

                let productReport = marge2Array(productInReport, productOutReport, 2).reduce((acc, val, ind) => {
                    acc.push({
                        ...val,
                        totalStock: parseFloat(val.stockIn ? val.stockIn : 0) - parseFloat(val.stockOut ? val.stockOut : 0)
                    })
                    return acc;
                }, [])

                return productReport.sort((a, b) => b.total - a.total)

            } catch (error) {
                throw new Error(error)
            }
        },
        async getReportCategoryByDate(_, {
            input
        }, context){
            try {
                let startDate = getDayOfMonth(convertTZ(input.startDate)).startDate
                let endDate = getDayOfMonth(convertTZ(input.endDate)).endDate

                let categoryOutReport = await SaleOrder.aggregate([
                    {
                        $match: { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } }
                    },
                    {
                        $unwind: "$products"
                    },
                    {
                        $group: {
                            _id: "$products.product",
                            qty: {$sum: "$products.qty"}
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            _id: "$_id",
                            category: {$first: "$product.category"},
                            stockOut: "$qty",
                        }
                    },
                    {
                        $group: {
                            _id: "$category",
                            stockOut: {$sum: "$stockOut"}
                        }
                    },
                    {
                        $lookup: {
                            from: 'categories',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'category'
                        }
                    },
                    {
                        $project: {
                            _id: "$_id",
                            description: {$first: "$category.description"},
                            stockOut: "$stockOut",
                        }
                    },
                    // {
                    //     $lookup: {
                    //         from: 'products',
                    //         localField: 'products.product',
                    //         foreignField: '_id',
                    //         as: 'product'
                    //     }
                    // },
                    // {
                    //     $lookup: {
                    //         from: 'categories',
                    //         localField: 'product.category',
                    //         foreignField: '_id',
                    //         as: 'categories'
                    //     }
                    // },
                    // {
                    //     $project: {
                    //         _id: { $first: "$product._id" },
                    //         categoryId: { $first: "$categories._id" },
                    //         description: { $first: "$categories.description" },
                    //         qty: { $first: "$products.qty" },
                    //     }
                    // },
                    // {
                    //     $group: {
                    //         _id: "$categoryId",
                    //         description: { $first: "$description" },
                    //         stockOut: { $sum: "$qty" }
                    //     }
                    // }
                ])

                let categoryInReport = await PurchaseOrders.aggregate([
                    {
                        $match: { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } }
                    },
                    {
                        $unwind: "$products"
                    },
                    {
                        $group: {
                            _id: "$products.product",
                            qty: {$sum: "$products.qty"}
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            _id: "$_id",
                            category: {$first: "$product.category"},
                            stockIn: "$qty",
                        }
                    },
                    {
                        $group: {
                            _id: "$category",
                            stockIn: {$sum: "$stockIn"}
                        }
                    },
                    {
                        $lookup: {
                            from: 'categories',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'category'
                        }
                    },
                    {
                        $project: {
                            _id: "$_id",
                            description: {$first: "$category.description"},
                            stockIn: "$stockIn",
                        }
                    },
                    // {
                    //     $project: {
                    //         _id: "$_id",
                    //         description: {$first: "$category.description"},
                    //         stockIn: "$stockIn",
                    //     }
                    // },
                    // {
                    //     $lookup: {
                    //         from: 'products',
                    //         localField: 'products.product',
                    //         foreignField: '_id',
                    //         as: 'product'
                    //     }
                    // },
                    // {
                    //     $lookup: {
                    //         from: 'categories',
                    //         localField: 'product.category',
                    //         foreignField: '_id',
                    //         as: 'categories'
                    //     }
                    // },
                    // {
                    //     $project: {
                    //         _id: { $first: "$product._id" },
                    //         categoryId: { $first: "$categories._id" },
                    //         description: { $first: "$categories.description" },
                    //         qty: { $first: "$products.qty" },
                    //     }
                    // },
                    // {
                    //     $group: {
                    //         _id: "$categoryId",
                    //         description: { $first: "$description" },
                    //         stockIn: { $sum: "$qty" }
                    //     }
                    // }
                ])

                // console.log(categoryInReport)


                let categoryReport = marge2Array(categoryInReport, categoryOutReport, 2).reduce((acc, val, ind) => {
                    acc.push({
                        ...val,
                        totalStock: parseFloat(val.stockIn ? val.stockIn : 0) - parseFloat(val.stockOut ? val.stockOut : 0)
                    })
                    return acc;
                }, [])

                return categoryReport.sort((a, b) => b.totalStock - a.totalStock)
            } catch (error) {
                throw new Error(error)
            }
        },
        async getReportSaleOrderByRangeDate(_, {
            input
        }, context){
            try {
                let startDate = getDayOfMonth(convertTZ(input.startDate)).startDate
                let endDate = getDayOfMonth(convertTZ(input.endDate)).endDate

                const saleOrder = await SaleOrder.find(
                    { "date": { "$gte": startDate, "$lte": endDate } }
                ).sort({ createdAt: -1 }).populate([
                    {
                        path: "customer",
                        populate: "id"
                    }
                ])

                return saleOrder
            } catch (error) {
                throw new Error(error)
            }
        },
        async getReportPurchaseOrderByRangeDate(_, {
            input
        }, context){
            try {
                let startDate = getDayOfMonth(convertTZ(input.startDate)).startDate
                let endDate = getDayOfMonth(convertTZ(input.endDate)).endDate

                const purchaseOrder = await PurchaseOrders.find(
                    { "date": { "$gte": startDate, "$lte": endDate } }
                ).sort({ createAt: -1 })
                .populate("supplier")

                return purchaseOrder
            } catch (error) {
                throw new Error(error)
            }
        }
    },
    Subscription: {

    }
}

export default reportResolvers