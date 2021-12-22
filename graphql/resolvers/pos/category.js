import { AuthenticationError, UserInputError } from "apollo-server-errors"
import { convertQueryDate, convertTZ } from "../../../functions/fn.js"
import Categories from "../../../models/pos/category.js"
import Products from '../../../models/pos/product.js'
import mongoose from 'mongoose'

const categoryResolvers = {
    Query: {
        async getCategories(_, {
            input
        }, context) {
            try {
                const reg = new RegExp(input?.keyword)
                let category = []
                if (input?.keyword === null || input?.keyword === "") {
                    category = await Categories.aggregate([
                        {
                            "$lookup": {
                                from: "products",
                                localField: '_id',
                                foreignField: 'category',
                                as: 'product'
                            }
                        },
                        {
                            $project: {
                                id: "$_id",
                                description: 1,
                                product: { $size: "$product" },
                            }
                        }
                    ]).sort({ createAt: -1 })
                } else {
                    if (mongoose.Types.ObjectId.isValid(input?.keyword)) {

                        category = await Categories.aggregate([
                            {
                                $match: {
                                    $or: [
                                        { "_id": mongoose.Types.ObjectId(input?.keyword) }
                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    from: "products",
                                    localField: '_id',
                                    foreignField: 'category',
                                    as: 'product'
                                }
                            },
                            {
                                $project: {
                                    id: "$_id",
                                    description: 1,
                                    product: { $size: "$product" },
                                }
                            }
                        ]).sort({ createAt: -1 })
                    } else {
                        category = await Categories.aggregate([
                            {
                                $match: {
                                    $or: [
                                        { description: reg }
                                    ]
                                }
                            },
                            {
                                "$lookup": {
                                    from: "products",
                                    localField: '_id',
                                    foreignField: 'category',
                                    as: 'product'
                                }
                            },
                            {
                                $project: {
                                    id: "$_id",
                                    description: 1,
                                    product: { $size: "$product" },
                                }
                            }
                        ]).sort({ createAt: -1 })
                    }
                }

                return {
                    data: category,
                    message: "ការបញ្ចូលបានជោគជ័យ",
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async getCategoriesRangeDate(_, {
            input
        }, context) {
            try {
                const category = await Categories.find(
                    { "createAt": { "$gte": convertQueryDate(input.startDate), "$lte": convertQueryDate(input.endDate) } }
                ).sort({ createdAt: -1 })

                return {
                    data: category,
                    message: "ការបញ្ចូលបានជោគជ័យ"
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Mutation: {
        async setCategories(_, {
            input
        }, context) {
            try {
                const findCategory = await Categories.find({ "description": input.description })

                if (findCategory?.length === 0) {
                    const newCategory = new Categories({
                        ...input,
                        createAt: convertTZ(new Date())
                    })

                    const category = await newCategory.save()

                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: category?.id,
                            action: "create",
                            title: `បានបង្កើតប្រភេទទំនិញ`,
                            content: `លេខ៖ ${category?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })

                    return category
                } else {
                    throw new Error('Category has been created')
                }
            } catch (err) {
                throw new UserInputError(err)
            }
        },
        async updateCategories(_, {
            input
        }, context) {
            try {
                const findCategory = await Categories.findByIdAndUpdate(input.id, {
                    description: input.description,
                    updateAt: convertTZ(new Date())
                })

                if (findCategory !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findCategory?.id,
                            action: "update",
                            title: `បានកែប្រែប្រភេទទំនិញ`,
                            content: `លេខ៖ ${findCategory?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })

                    return "ការកែប្រែបានជោគជ័យ"
                } else {
                    throw new Error('Category not found')
                }

            } catch (err) {
                throw new Error(err)
            }
        },
        async deleteCategories(_, {
            input
        }, context) {
            try {
                const findProductByCategory = await Products.find({ "category._id": input.id })
                // console.log("test")

                if (findProductByCategory.length === 0) {
                    const findCategory = await Categories.findByIdAndDelete(input.id)

                    if (findCategory !== null) {
                        context.pubsub.publish('NEW_NOTICE', {
                            newNotice: {
                                id: findCategory?.id,
                                action: "delete",
                                title: `បានលុបប្រភេទទំនិញ`,
                                content: `លេខ៖ ${findCategory?.id}`,
                                user: "",
                                createAt: new Date()
                            }
                        })

                        return "ការលុបបានជោគជ័យ"
                    } else {
                        throw new UserInputError('Category not found')
                    }
                } else {
                    throw new Error('Category got product applied')
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Subscription: {
        newCategory: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['NEW_CATEGORY'])
        }
    }
}

export default categoryResolvers