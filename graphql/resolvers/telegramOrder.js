import TelegramOrder from '../../models/TelegramOrder.js';
import TelegramUser from '../../models/TelegramUser.js';

const telegramOrder = {
    Query: {

    },
    Mutation: {
        async telegramOrder(_, {
            input
        }, context) {
            try {
                console.log(input)
                const user = await TelegramUser.findOne({"user_id": input.user_id})
                // console.log(user)
                const newOrder = new TelegramOrder({
                    user: user._id,
                    createdAt: new Date().toUTCString()
                })

                const order = await newOrder.save()

                return {
                    data: order,
                    message: true
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async telegramOrderUpdate(_, {
            input
        }, context) {
            try {
                console.log(input)
                await TelegramOrder.findOneAndUpdate({"_id": input.orderId}, {
                    text: input.text,
                    typeText: input.typeText,
                    geolocation: {
                        lat: input.lat,
                        long: input.long,
                    },
                })

                const order = await TelegramOrder.findOne({"_id": input.orderId})

                return {
                    data: order,
                    message: true
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async telegramOrderDelete(_, {
            orderId
        }, context) {
            try {
                await TelegramOrder.deleteOne({"_id": orderId})

                return {
                    message: true
                }
            } catch (err) {
                throw new Error(err)
            }
        },
    },
    Subscription: {

    }
}

export default telegramOrder