import { AuthenticationError } from "apollo-server-errors"
import { getAuth } from 'firebase-admin/auth'
import { convertTZ } from "../../../functions/fn.js"
import Suppliers from "../../../models/pos/supplier.js"
import mongoose from 'mongoose'
import Users from "../../../models/pos/user.js"
import Contents from "../../../models/pos/content.js"

const userResolvers = {
    Query: {
        async getUsers(_, {
            input
        }, context) {
            try {
                const reg = new RegExp(input?.keyword)
                let users = []
                if (input?.keyword === null || input?.keyword === "") {
                    users = await Users.find().sort({ createAt: -1 }).skip((input?.current - 1) * input?.limit).limit(input?.limit).populate({
                        path: "contentRole",
                        populate: "content"
                    })
                } else {
                    if (mongoose.Types.ObjectId.isValid(input?.keyword)) {
                        users = await Users.find({
                            $or: [
                                { "_id": mongoose.Types.ObjectId(input?.keyword) }
                            ]
                        }).sort({ createAt: -1 }).skip((input?.current - 1) * input?.limit).limit(input?.limit)
                    } else {
                        users = await Users.find({
                            $or: [
                                { "email": reg }
                            ]
                        }).sort({ createAt: -1 }).skip((input?.current - 1) * input?.limit).limit(input?.limit).populate({
                            path: "contentRole",
                            populate: "content"
                        })
                    }
                }

                const pageCount = await Users.countDocuments()

                return {
                    data: users,
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
        async getContentById(_, {
            input
        }, context) {
            try {
                // console.log(input)
                const user = await Users.findOne({ uid: input.id })
                const contents = await Users.aggregate([
                    {
                        $match: { _id: mongoose.Types.ObjectId(user.id) }
                    },
                    {
                        $lookup: {
                            from: 'contents',
                            localField: 'contentRole.content',
                            foreignField: '_id',
                            as: 'content'
                        }
                    },
                    {
                        $unwind: "$contentRole"
                    },
                    {
                        $unwind: "$content"
                    },
                    {
                        $group: {
                            _id: "$content._id",
                            view: { $first: "$contentRole.view" },
                            create: { $first: "$contentRole.create" },
                            update: { $first: "$contentRole.update" },
                            delete: { $first: "$contentRole.delete" },
                            // all: {$first: "$contentRole.all"},
                            contentId: { $first: "$contentRole.content" },
                            title: { $first: "$content.title" },
                            path: { $first: "$content.path" },
                            sub: { $first: "$content.sub" },
                            menu: { $first: "$content.menu" },
                            createAt: { $first: "$content.createAt" }
                        }
                    },
                    {
                        $sort: { createAt: 1 }
                    }

                ])

                return {
                    profile: user,
                    content: contents
                }
            } catch (e) {
                throw new Error(e)
            }
        }
    },
    Mutation: {
        async addUser(_, {
            input
        }, context) {
            try {
                const registerAuth = await getAuth().createUser({
                    displayName: input?.displayName,
                    email: input?.email,
                    password: input?.password,
                })

                const newUser = new Users({
                    displayName: registerAuth.displayName,
                    email: registerAuth.email,
                    uid: registerAuth.uid,
                    contentRole: input.contentRole
                })

                const user = await newUser.save()

                context.pubsub.publish('NEW_NOTICE', {
                    newNotice: {
                        id: user?.id,
                        action: "create",
                        title: `បានបង្កើតអ្នកផ្គត់ផ្គង់`,
                        content: `លេខ៖ ${user?.id}`,
                        user: "",
                        createAt: new Date()
                    }
                })

                return user
            } catch (err) {
                throw new AuthenticationError(err)
            }
        },
        async updateUser(_, {
            input
        }, context) {
            try {
                const updateAuth = await getAuth().updateUser(input.uid, {
                    email: input.email,
                    password: input.password,
                    displayName: input.displayName,
                })

                const findUser = await Users.findByIdAndUpdate(input.id, {
                    ...input,
                    updateAt: convertTZ(new Date())
                })

                if (findUser !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findUser.id,
                            action: "update",
                            title: `បានកែប្រែអ្នកប្រើប្រាស់`,
                            content: `លេខ៖ ${input.id}`,
                            user: "",
                            createAt: convertTZ(new Date())
                        }
                    })

                    return "ការកែប្រែបានជោគជ័យ"
                } else {
                    throw new Error("Can't update data")
                }

            } catch (err) {
                throw new Error(err)
            }
        },
        async deleteUser(_, {
            input
        }, context) {
            try {
                const findUser = await Users.findByIdAndDelete(input.id)

                if (findUser !== null) {
                    context.pubsub.publish('NEW_NOTICE', {
                        newNotice: {
                            id: findUser.id,
                            action: "delete",
                            title: `បានលុបអ្នកប្រើប្រាស់`,
                            content: `លេខ៖ ${input.id}`,
                            user: "",
                            createAt: convertTZ(new Date())
                        }
                    })

                    return "ការលុបបានជោគជ័យ"
                } else {
                    throw new Error('Action not allowed')
                }
            } catch (err) {
                throw new AuthenticationError(err)
            }
        },
        async updateContent(_, {
            input
        }, context) {
            try {
                const contentRole = input?.contentRole
                const newArray = []

                const getSubContent = await Contents.find({ menu: false })

                contentRole.map(async load => {
                    if (load.view === true) {
                        const content = getSubContent.find(ele => ele.type === "view" && ele.sub.toString() === load.content)
                        if (content !== undefined) {
                            newArray.push({
                                content: content._id,
                                view: true,
                                create: true,
                                update: true,
                                delete: true
                            })
                        }
                    }
                    if (load.create === true) {
                        const content = getSubContent.find(ele => ele.type === "create" && ele.sub.toString() === load.content)
                        // console.log(load.content)
                        if (content !== undefined) {
                            newArray.push({
                                content: content._id,
                                view: true,
                                create: true,
                                update: true,
                                delete: true
                            })
                        }
                    }
                    if (load.update === true) {
                        const content = getSubContent.find(ele => ele.type === "update" && ele.sub.toString() === load.content)
                        if (content !== undefined) {
                            newArray.push({
                                content: content._id,
                                view: true,
                                create: true,
                                update: true,
                                delete: true
                            })
                        }
                    }
                    if (load.delete === true) {
                        const content = getSubContent.find(ele => ele.type === "delete" && ele.sub.toString() === load.content)
                        if (content !== undefined) {
                            newArray.push({
                                content: content._id,
                                view: true,
                                create: true,
                                update: true,
                                delete: true
                            })
                        }
                    }
                })

                await Users.findOneAndUpdate({ _id: input.id }, {
                    contentRole: [...contentRole, ...newArray]
                })

                return "ក្រែប្រែបានជោគជ័យ"
            } catch {
                throw new Error(err)
            }
        }
    },
    Subscription: {

    }
}

export default userResolvers