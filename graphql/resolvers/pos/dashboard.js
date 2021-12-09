import { convertTZ, getDayOfDay, getDayOfYear } from "../../../functions/fn.js"
import Customers from "../../../models/pos/customer.js"
import mongoose from 'mongoose'
import Delivers from "../../../models/pos/deliver.js"
import Suppliers from "../../../models/pos/supplier.js"
import SaleOrder from "../../../models/pos/saleOrder.js"
import PurchaseOrder from '../../../models/pos/purchaseOrder.js'
import moment from "moment"
import { getDayOfMonth, convertQueryDate } from '../../../functions/fn.js'
import Reconciliation from "../../../models/pos/reconciliation.js"

const dashboardResolvers = {
    Query: {
        async getDashboard(_, {
            input
        }, context) {
            try {
                let startDate = getDayOfMonth(convertTZ(new Date())).startDate
                let endDate = getDayOfMonth(convertTZ(new Date())).endDate

                let startDateOfYear = getDayOfYear(convertTZ(new Date())).startDate
                let endDateOfYear = getDayOfYear(convertTZ(new Date())).endDate

                const customerCount = await Customers.countDocuments()
                const deliverCount = await Delivers.countDocuments()
                const supplierCount = await Suppliers.countDocuments()

                const newCustomerCount = await Customers.find({
                    "createAt": {
                        "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate)
                    }
                    }).countDocuments()
                const newDeliverCount = await Delivers.find({
                    "createAt": {
                        "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate)
                    }
                    }).countDocuments()
                const newSupplierCount = await Suppliers.find({
                    "createAt": {
                        "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate)
                    }
                    }).countDocuments()

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

                const expPaidAmount = await PurchaseOrder.aggregate([
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

                const expNonPaidAmount = await PurchaseOrder.aggregate([
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


                // console.log(getDayOfDay(2))

                const poRecord = await PurchaseOrder.aggregate([
                    {
                        $match: {
                            $and: [
                                { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } },
                            ]
                        }
                    },
                    {
                        $project:
                        {
                            month: { $dateToString: { format: "%Y-%m-%d", date: "$createAt" } },
                            date: { $dateToString: { format: "%d", date: "$createAt" } },
                            grandTotal: 1
                        }
                    },
                    {
                        $group: {
                            _id: "$month",
                            date: { $first: "$date" },
                            count: { $sum: 1 },
                            total: { $sum: "$grandTotal" }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            date: { $toInt: "$date" },
                            count: 1,
                            total: 1
                        }
                    }
                ]);

                const slRecord = await SaleOrder.aggregate([
                    {
                        $match: {
                            $and: [
                                { "date": { "$gte": convertQueryDate(startDate), "$lte": convertQueryDate(endDate) } },
                            ]
                        }
                    },
                    {
                        $project:
                        {
                            month: { $dateToString: { format: "%Y-%m-%d", date: "$createAt" } },
                            date: { $dateToString: { format: "%d", date: "$createAt" } },
                            grandTotal: 1
                        }
                    },
                    {
                        $group: {
                            _id: "$month",
                            date: { $first: "$date" },
                            count: { $sum: 1 },
                            total: { $sum: "$grandTotal" }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            date: { $toInt: "$date" },
                            count: 1,
                            total: 1
                        }
                    }
                ]);

                const reconYearRecord = await Reconciliation.aggregate([
                    {
                        $match: {
                            $and: [
                                { "date": { "$gte": convertQueryDate(startDateOfYear), "$lte": convertQueryDate(endDateOfYear) } },
                            ]
                        }
                    },
                    {
                        $project:
                        {
                            _id: 1,
                            code: 1,
                            month: { $dateToString: { format: "%m", date: "$date" } },
                            income: { $add: ["$accounting.income.paid", "$accounting.income.nonPaid"]},
                            expense: { $add: ["$accounting.expense.paid", "$accounting.expense.nonPaid"]}
                        }
                    }
                ]);

                return {
                    top: {
                        newCustomer: newCustomerCount,
                        newDeliver: newDeliverCount,
                        newSupplier: newSupplierCount,
                        customer: customerCount,
                        deliver: deliverCount,
                        supplier: supplierCount,
                    },
                    topExp: poRecord,
                    topInc: slRecord,
                    incData: {
                        paid: sumIncNonPaid,
                        nonPaid: sumIncPaid
                    },
                    expData: {
                        paid: sumExpPaid,
                        nonPaid: sumExpNonPaid
                    },
                    total: {
                        expense: sumExpNonPaid + sumExpPaid,
                        income: sumIncNonPaid + sumIncPaid
                    },
                    dataYearRecord: reconYearRecord
                }
            } catch (error) {
                throw new Error(error)
            }
        }
    },
    Mutation: {

    },
    Subscription: {

    }
}

export default dashboardResolvers