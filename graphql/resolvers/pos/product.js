import { AuthenticationError } from "apollo-server-errors"
import { convertTZ } from "../../../functions/fn.js"
import Products from "../../../models/pos/product.js"
import mongoose from 'mongoose'

const productResolvers = {
    Query: {
        async getProducts(_, {
            input
        }, context) {
            try {
                const reg = new RegExp(input?.keyword)
                let product = []
                if (input?.keyword === null || input?.keyword === "") {
                    product = await Products.find().sort({ createAt: -1 }).populate("category").skip((input?.current - 1) * input?.limit).limit(input?.limit)
                } else {
                    if (mongoose.Types.ObjectId.isValid(input?.keyword)) {
                        product = await Products.find({
                            $or: [
                                { "_id": mongoose.Types.ObjectId(input?.keyword) }
                            ]
                        }).sort({ createAt: -1 }).populate("category").skip((input?.current - 1) * input?.limit).limit(input?.limit)
                    } else {
                        product = await Products.find({
                            $or: [
                                { "code": reg },
                                { "description": reg },
                                { "remark": reg },
                            ]
                        }).sort({ createAt: -1 }).populate("category").skip((input?.current - 1) * input?.limit).limit(input?.limit)
                    }
                }

                const pageCount = await Products.countDocuments()

                return {
                    data: product,
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
        async getProductById(_, {
            input
        }, context) {
            try {
                const product = await Products.findById(input.id).populate("category")

                return product
            } catch (err) {
                throw new Error(err)
            }
        },
        async getProductBySelectCTG(_, {
            input
        }, context) {
            try {
                let product = []
                let pageCount = 0
                if (input.id !== "all") {
                    product = await Products.find({
                        "category": mongoose.Types.ObjectId(input?.id)
                    }).populate("category").skip((input?.current - 1) * input?.limit).limit(input?.limit)

                    pageCount = await Products.find({
                        "category": mongoose.Types.ObjectId(input?.id)
                    }).countDocuments()
                } else {
                    product = await Products.find().populate("category").skip((input?.current - 1) * input?.limit).limit(input?.limit)

                    pageCount = await Products.find().countDocuments()
                }


                return {
                    data: product,
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
        async getProductsRangeDate(_, {
            input
        }, context) {
            try {
                const product = await Products.find(
                    { "createAt": { "$gte": convertQueryDate(input.startDate), "$lte": convertQueryDate(input.endDate) } }
                ).sort({ createdAt: -1 })

                return {
                    data: product,
                    message: "ការបញ្ចូលបានជោគជ័យ"
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Mutation: {
        async setProducts(_, {
            input
        }, context) {
            try {
                console.log(input)
                const findProduct = await Products.find({
                    $or: [
                        // { "code": input?.code },
                        { "description": input?.description }
                    ]
                })

                if (findProduct?.length === 0) {
                    const newProduct = new Products({
                        ...input,
                        createAt: convertTZ(new Date())
                    })

                    const product = await newProduct.save().then(res => res.populate("category"))

                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: product?.id,
                            action: "create",
                            title: `បានបង្កើតបទំនិញ`,
                            content: `លេខ៖ ${product?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })

                    return product
                } else {
                    throw new Error('Product not found')
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async updateProducts(_, {
            input
        }, context) {
            try {
                // console.log(id, input)
                const findProduct = await Products.findByIdAndUpdate(input.id, {
                    ...input,
                    updateAt: convertTZ(new Date())
                })

                if (findProduct !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findProduct?.id,
                            action: "update",
                            title: `បានកែប្រែទំនិញ`,
                            content: `លេខ៖ ${findProduct?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })

                    return "ការកែប្រែបានជោគជ័យ"
                } else {
                    throw new Error('Product not found')
                }

            } catch (err) {
                throw new Error(err)
            }
        },
        async deleteProducts(_, {
            input
        }, context) {
            try {
                const findProduct = await Products.findByIdAndDelete(input.id)

                if (findProduct !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findProduct?.id,
                            action: "delete",
                            title: `បានលុបទំនិញ`,
                            content: `លេខ៖ ${findProduct?.id}`,
                            user: "",
                            createAt: new Date()
                        }
                    })

                    return "ការលុបបានជោគជ័យ"
                } else {
                    throw new Error('Product not found')
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Subscription: {
        newProduct: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['NEW_PRODUCT'])
        }
    }
}

export default productResolvers