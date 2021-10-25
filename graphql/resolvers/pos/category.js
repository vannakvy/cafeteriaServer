import { AuthenticationError } from "apollo-server-errors"
import moment from "moment"
import { convertQueryDate, convertTZ } from "../../../functions/fn.js"
import Categories from "../../../models/pos/category.js"

const categoryResolvers = {
    Query: {
        async getCategories(_, {
            start, end
        }, context) {
            try {
                const category = await Categories.find().sort({ createdAt: -1 })

                return {
                    data: category,
                    message: "ការបញ្ចូលបានជោគជ័យ"
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
                const reg = new RegExp(input.description)
                const findCategory = await Categories.find({ "description": reg })

                if (findCategory?.length === 0) {
                    const newCategory = new Categories({
                        ...input,
                        createAt: convertTZ(new Date())
                    })

                    const category = await newCategory.save()

                    context.pubsub.publish('NEW_CATEGORY', {
                        newCategory: category
                    })

                    return category
                } else {
                    throw new AuthenticationError('Action not allowed')
                }
            } catch (err) {
                throw new Error(err)
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
                    return "ការកែប្រែបានជោគជ័យ"
                } else {
                    throw new AuthenticationError('Action not allowed')
                }

            } catch (err) {
                throw new Error(err)
            }
        },
        async deleteCategories(_, {
            input
        }, context) {
            try {
                const findCategory = await Categories.findByIdAndDelete(input.id)

                if (findCategory !== null) {
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
        newCategory: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['NEW_CATEGORY'])
        }
    }
}

export default categoryResolvers