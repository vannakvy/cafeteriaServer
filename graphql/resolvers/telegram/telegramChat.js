import TelegramChat from '../../../models/telegram/TelegramChat.js';
import TelegramUser from '../../../models/telegram/TelegramUser.js';

const telegramChat = {
    Query: {

    },
    Mutation: {
        async telegramChat(_, {
            input
        }, context) {
            try {
                const user = await TelegramUser.findOne({ "user_id": input.user_id })
                if (user !== null) {
                    const newChat = new TelegramChat({
                        text: input.text,
                        typeText: input.typeText,
                        user: user._id,
                        createdAt: new Date().toUTCString()
                    })

                    const chat = await newChat.save()

                    return {
                        data: chat,
                        message: true
                    }
                } else {
                    return {
                        data: {
                            text: "",
                            createdAt: ""
                        },
                        message: false
                        // "សូមអតិថិជនធ្វើការចុះឈ្មោះសិនមិននឹងចាប់ផ្តើមជជែក\nដោយចុច /register ដើម្បីចុះឈ្មោះ"
                    }
                }

            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Subscription: {

    }
}

export default telegramChat