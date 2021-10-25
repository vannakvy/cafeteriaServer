import { AuthenticationError } from "apollo-server-errors"
import { convertTZ } from "../../../functions/fn.js"
import Products from "../../../models/pos/product.js"

const productResolvers = {
    Query: {
        async getProducts() {
            try {
                const product = await Products.find().sort({ createdAt: -1 })

                return {
                    data: product,
                    message: "ការបញ្ចូលបានជោគជ័យ"
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
                const reg = new RegExp(input.description)
                const reg1 = new RegExp(input.code)
                const findProduct = await Products.find({ $or: [
                    {"code": reg},
                    {"description": reg1}
                ] })

                if (findProduct?.length === 0) {
                    const newProduct = new Products({
                        ...input,
                        createAt: convertTZ(new Date())
                    })

                    const product = await newProduct.save().then(res => res.populate("category"))

                    context.pubsub.publish('NEW_PRODUCT', {
                        newProduct: product
                    })

                    return product
                } else {
                    throw new AuthenticationError('Action not allowed')
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async updateProducts(_, {
            input
        }, context) {
            try {
                const findProduct = await Products.findByIdAndUpdate(input.id, {
                    ...input,
                    updateAt: convertTZ(new Date())
                })

                if (findProduct !== null) {
                    return "ការកែប្រែបានជោគជ័យ"
                } else {
                    throw new AuthenticationError('Action not allowed')
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
        newProduct: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['NEW_PRODUCT'])
        }
    }
}

export default productResolvers