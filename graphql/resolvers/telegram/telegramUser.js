import TelegramUser from '../../../models/telegram/TelegramUser.js';

const telegramUser = {
    Query: {
        async getTelegramAdmins() {
            try {
                const telegramAdmins = await TelegramUser.find({"admin_type": true}).sort({ createdAt: -1 });

                return telegramAdmins;
            } catch (err) {
                throw new Error(err)
            }
        },
        async getTelegramUsers(_, {
            user_id
        }, context) {
            try {
                console.log(user_id)
                const telegramUsers = await TelegramUser.findOne({"user_id": user_id});

                return telegramUsers;
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Mutation: {
        async telegramRegister(_, {
            input
        }, context) {
            const user = await TelegramUser.findOne({ "user_id": input.user_id })
            console.log(input)
            if (user === null) {
                const newRegister = new TelegramUser({
                    ...input,
                    createdAt: new Date().toISOString()
                })

                const register = await newRegister.save()
                return {
                    data: register,
                    message: "ការចុះឈ្មោះជាអ្នកប្រើប្រាស់បានជោគជ័យ។"
                }
            } else {
                if (input.admin_type) {
                    if (user.admin_type !== input.admin_type) {
                        await TelegramUser.updateOne({ "user_id": user.user_id }, { admin_type: true })

                        return {
                            data: user,
                            message: "ការចុះឈ្មោះជា Admin បានជោគជ័យ។"
                        }
                    } else {
                        return {
                            data: user,
                            message: "គណនីរបស់អ្នកធ្លាប់បានចុះឈ្មោះរួចរាល់"
                        }
                    }

                } else if (input.user_type) {
                    if (user.user_type !== input.user_type) {
                        await TelegramUser.updateOne({ "user_id": user.user_id }, { user_type: true })

                        return {
                            data: user,
                            message: "ការចុះឈ្មោះជាអ្នកប្រើប្រាស់បានជោគជ័យ។"
                        }
                    } else {
                        return {
                            data: user,
                            message: "គណនីរបស់អ្នកធ្លាប់បានចុះឈ្មោះរួចរាល់"
                        }
                    }
                }
            }
        },
        async telegramUserUpdate(_, {
            input
        }, context) {
            try {
                // console.log(input)
                await TelegramUser.findOne({"user_id": input.user_id})
                await TelegramUser.findOneAndUpdate({"user_id": input.user_id}, {
                    geolocation: {
                        lat: input.lat,
                        long: input.long,
                    },
                })

                const user = await TelegramUser.findOne({"user_id": input.user_id})

                return {
                    data: user,
                    message: true
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Subscription: {
        newPost: {
            // subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['NEW_POST'])
        }
    }
}

export default telegramUser