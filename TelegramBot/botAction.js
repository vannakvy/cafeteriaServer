import axios from "axios";
import { fetchData, fetchDataWithVariable, PostData } from "../functions/fn.js";
import { REGISTER, FETCH_GET_USER, FETCH_GET_ADMIN, USER_UPDATE } from "./graphql/user.js";
import pkg from 'websocket'
import { CHAT } from "./graphql/chat.js";
import { ORDER, ORDER_DELETE, ORDER_UPDATE } from "./graphql/order.js";

export const botAction = async (bot) => {
    const url = "http://localhost:5000/graphql"
    const imgUrl = "https://firebasestorage.googleapis.com/v0/b/travel-statistic.appspot.com/o/Photo%2Fmenu.jpg?alt=media&token=7ae148fc-c751-4de5-a871-e791513abec6"

    // setTimeout(async () => {
    //     adminData = await fetchData(FETCH_GET_ADMIN).getTelegramAdmins
    //     console.log(await fetchData(FETCH_GET_ADMIN))

    // }, 1000)

    bot.onText(/\/echo (.+)/, async (msg, match) => {

        const chatId = msg.chat.id;
        const resp = match[1];

        bot.sendMessage(chatId, resp);
    });

    bot.onText(/\/reply (.+)/, (msg, match) => {
        const chatId = msg.chat.id;
        const resp = match.input;

        const arrayText = resp.split(/[@,\n]/)

        var index = adminAcc.findIndex(ele => ele.user_id === chatId)

        if (index !== -1) {
            bot.sendMessage(arrayText[1], arrayText[3]);
        }
    });

    bot.onText(/^\/start/, (msg, match) => {
        bot.sendPhoto(msg.chat.id,
            imgUrl
            , { caption: "ខាងលើនេះជាបញ្ចីមុខទំនិញ 👆👆👆" }).then(() => {
                const option = {
                    "parse_mode": "Markdown",
                    "reply_markup": {
                        "one_time_keyboard": true,
                        "keyboard": [[{
                            text: "ផ្ញើលេខទូរស័ព្ទរបស់ខ្ញុំ",
                            request_contact: true,
                        }]],
                    },
                };
                bot.sendMessage(msg.chat.id, "តើក្រុមការងារអាចទាក់ទងអ្នកតាមរបៀបណា?", option).then(() => {
                    bot.once("contact", async (msg) => {
                        var { contact } = msg;
                        await axios({
                            url: url,
                            method: "post",
                            data: {
                                query: REGISTER,
                                variables: {
                                    input: {
                                        ...contact,
                                        user_type: true,
                                        admin_type: false,
                                    }
                                }
                            },
                        }).then((response) => {
                            const res = response.data.data.telegramRegister

                            bot.sendMessage(msg.chat.id, res.message).then(() => {
                                bot.sendMessage(msg.chat.id, "<b>/menu</b> មតិកា\n<b>1. /register</b> ការចុះឈ្មោះ\n<b>2. /item មុខទំនិញនិងតម្លៃ</b>\n<b>3. /order កម្ម៉ងទំនិញ</b>\n<b>4. /companyInfo</b> ព័ត៌មានទំនាក់ទំនង", { parse_mode: "HTML" });
                            })
                        }).catch(err => {
                            console.log(err.message)
                        })
                    });
                });
            });
    });

    bot.onText(/^\/admin/, (msg, match) => {
        const option = {
            "parse_mode": "Markdown",
            "reply_markup": {
                "one_time_keyboard": true,
                "keyboard": [[{
                    text: "លេខទូរស័ព្ទរបស់ខ្ញុំ",
                    request_contact: true,
                }]],
            },
        };
        bot.sendMessage(msg.chat.id, "ផ្ញើលេខទំនាក់ទំនងរបស់អ្នក?", option).then(() => {
            bot.once("contact", (msg) => {
                var { contact } = msg;
                bot.sendMessage(msg.chat.id, "បញ្ចូលលេខសម្ងាត់ Admin!").then(() => {
                    bot.once("message", async (msg) => {
                        if (msg.text === "goglobal@123") {
                            await axios({
                                url: url,
                                method: "post",
                                data: {
                                    query: REGISTER,
                                    variables: {
                                        input: {
                                            ...contact,
                                            user_type: false,
                                            admin_type: true,
                                        }
                                    }
                                },
                            }).then((response) => {
                                const res = response.data.data.telegramRegister
                                bot.sendMessage(msg.chat.id, res.message)
                            }).catch(err => {
                                console.log(err.message)
                            })
                        }
                    })
                });
            });
        });
    });

    bot.onText(/^\/register/, function (msg, match) {
        const option = {
            "parse_mode": "Markdown",
            "reply_markup": {
                "one_time_keyboard": true,
                "keyboard": [[{
                    text: "ផ្ញើលេខទូរស័ព្ទរបស់ខ្ញុំ",
                    request_contact: true,
                }]],
            },
        };
        bot.sendMessage(msg.chat.id, "តើក្រុមការងារអាចទាក់ទងអ្នកតាមរបៀបណា?", option).then(() => {
            bot.once("contact", async (msg) => {
                var { contact } = msg;
                await axios({
                    url: url,
                    method: "post",
                    data: {
                        query: REGISTER,
                        variables: {
                            input: {
                                ...contact,
                                user_type: true,
                                admin_type: false,
                            }
                        }
                    },
                }).then((response) => {
                    const res = response.data.data.telegramRegister

                    bot.sendMessage(msg.chat.id, res.message).then(() => {
                        bot.sendMessage(msg.chat.id, "<b>/menu</b> មតិកា\n<b>1. /register</b> ការចុះឈ្មោះ\n<b>2. /item មុខទំនិញនិងតម្លៃ</b>\n<b>3. /order កម្ម៉ងទំនិញ</b>\n<b>4. /companyInfo</b> ព័ត៌មានទំនាក់ទំនង", { parse_mode: "HTML" });
                    })
                }).catch(err => {
                    console.log(err.message)
                })
            });
        });
    });

    bot.onText(/^\/order/, async (msg, match) => {
        bot.sendMessage(msg.chat.id, "<b>សូមផ្ញើការកម្ម៉ងរបស់អ្នកនៅខាងក្រោម!</b>\n\nឧទាហរណ៍៖\nថ្ងៃទី16 ខែកញ្ញា ឆ្នាំ2021\nត្រីរ៉ស់ 1គីឡូ\nជ្រូកបីជាន់ 2គីឡូ\n\nសូមផ្ញើការកម្ម៉ងតាមគំរូខាងលើ ☝️☝️☝️", { parse_mode: "HTML" }).then(() => {
            bot.once("message", async (msg) => {
                const option = {
                    "parse_mode": "Markdown",
                    "reply_markup": {
                        "one_time_keyboard": true,
                        "keyboard": [[{
                            text: "ផ្ញើទីតាំងរបស់ខ្ញុំ",
                            request_location: true,
                        }]],
                    },
                };

                var orderText = msg?.text
                var orderVoice = msg?.voice
                var orderSticker = msg?.sticker
                var orderPhoto = msg?.photo
                var docRef = ""
                var condition = 0

                // console.log(msg)

                let order = null

                order = await PostData(ORDER, {
                    input: {
                        user_id: parseInt(msg.chat.id),
                    }
                })

                console.log(order?.telegramOrder?.data)

                // bot.sendPhoto(msg.chat.id, photoText[0]?.file_id)

                if (orderText !== undefined) {
                    order = await PostData(ORDER_UPDATE, {
                        input: {
                            user_id: parseInt(msg.chat.id),
                            orderId: order?.telegramOrder?.data?.id,
                            text: orderText,
                            typeText: "text"
                        }
                    })
                } else if (orderVoice !== undefined) {
                    order = await PostData(ORDER_UPDATE, {
                        input: {
                            user_id: parseInt(msg.chat.id),
                            orderId: order?.telegramOrder?.data?.id,
                            text: orderVoice.file_id,
                            typeText: "voice"
                        }
                    })
                } else if (orderSticker !== undefined) {
                    order = await PostData(ORDER_UPDATE, {
                        input: {
                            user_id: parseInt(msg.chat.id),
                            orderId: order?.telegramOrder?.data?.id,
                            text: orderSticker.file_id,
                            typeText: "sticker"
                        }
                    })
                } else if (orderPhoto !== undefined) {
                    order = await PostData(ORDER_UPDATE, {
                        input: {
                            user_id: parseInt(msg.chat.id),
                            orderId: order?.telegramOrder?.data?.id,
                            text: orderPhoto[0]?.file_id,
                            typeText: "photo"
                        }
                    })
                }
                else {
                  condition = 1
                  bot.sendMessage(msg.chat.id, "ការផ្ញើរបស់អ្នកមិនត្រឹមត្រូវទេ!").then(async () => {
                    await PostData(ORDER_DELETE, {
                        orderId: order?.telegramOrder?.data?.id,
                    }).then(() => {
                        bot.sendMessage(msg.chat.id, "/order ដើម្បីកម្ម៉ងម្តងទៀត។")
                    })
                  })
                }

                if (condition === 0) {

                    // location
                    bot.sendMessage(msg.chat.id, "ការកម្ម៉ងត្រូវបានរក្សាទុក!", option)
                        .then(() => {
                            bot.once("location", async (msg) => {
                                bot.sendMessage(msg.chat.id, "ក្រុមការងារយើងខ្ញុំនឹងរៀបចំការកម៉្មងតាមទីតាំង\n" + [msg.location.longitude, msg.location.latitude].join(";"));
                                var location = msg.location


                                if (location !== undefined) {
                                    order = await PostData(ORDER_UPDATE, {
                                        input: {
                                            user_id: parseInt(msg.chat.id),
                                            orderId: order?.telegramOrderUpdate?.data?.id,
                                            lat: parseFloat(location?.latitude),
                                            long: parseFloat(location?.longitude)
                                        }
                                    })
                                    console.log(order)

                                    await PostData(USER_UPDATE, {
                                        input: {
                                            user_id: parseInt(msg.chat.id),
                                            lat: parseFloat(location?.latitude),
                                            long: parseFloat(location?.longitude)
                                        }
                                    })
                                }

                            })
                        })
                }

            });
        })
    });

    bot.onText(/^\/item/, (msg, match) => {
        const option = {
            "parse_mode": "HTML",
            "reply_markup": {
                "one_time_keyboard": true,
                "keyboard": [
                    ["/បន្លែ", "/ផ្លែឈើ"],
                    ["/ត្រី&សាច់"],
                    ["/បញ្ចីទំនិញជារូបភាព"]
                ],
            },
        };
        bot.sendMessage(msg.chat.id, "<b>ជ្រើសរើសដើម្បីបង្ហាញ</b>", option)
    });

    // bot.onText(/^\/បន្លែ/, (msg, match) => {
    //     bot.sendMessage(msg.chat.id, "<b>ប្រភេទបន្លែ</b>\n" + convert(items.filter(item => item.category === "XNEa8HL8n3hYpJgQLEIV")), { parse_mode: "HTML" }).then(() => {
    //         bot.sendMessage(msg.chat.id, "/menu ត្រលប់ទៅមតិការ")
    //     })
    // });
    // bot.onText(/^\/ផ្លែឈើ/, (msg, match) => {
    //     bot.sendMessage(msg.chat.id, "<b>ប្រភេទផ្លែឈើ</b>\n" + convert(items.filter(item => item.category === "5PywgUR0O2Gsg6YnoPF4")), { parse_mode: "HTML" }).then(() => {
    //         bot.sendMessage(msg.chat.id, "/menu ត្រលប់ទៅមតិការ")
    //     })
    // });
    // bot.onText(/^\/ត្រី&សាច់/, (msg, match) => {
    //     bot.sendMessage(msg.chat.id, "<b>ប្រភេទត្រី&សាច់</b>\n" + convert(items.filter(item => item.category === "TRyeai0ZkH9mgIh993q4")), { parse_mode: "HTML" }).then(() => {
    //         bot.sendMessage(msg.chat.id, "/menu ត្រលប់ទៅមតិការ")
    //     })
    // });

    bot.onText(/^\/បញ្ចីទំនិញជារូបភាព/, (msg, match) => {
        bot.sendPhoto(msg.chat.id, imgUrl, { caption: "ខាងលើនេះជាបញ្ចីមុខទំនិញ 👆👆👆" });
    });

    bot.onText(/^\/companyInfo/, (msg, match) => {
        bot.sendMessage(msg.chat.id, "<b>ព័ត៌មានទំនាក់ទំនង</b>\n010 50 33 75\n085 277 116\nស្វែងរកទីតាំងរបស់យើងនៅខាងក្រោម", { parse_mode: "HTML" }).then(() => {
            bot.sendLocation(msg.chat.id, 13.34793624285244, 103.84409104752588);
        });
    });

    bot.onText(/^\/menu/, (msg, match) => {
        bot.sendMessage(msg.chat.id, "<b>/menu</b> មតិកា\n<b>1. /register</b> ការចុះឈ្មោះ\n<b>2. /item មុខទំនិញនិងតម្លៃ</b>\n<b>3. /order កម្ម៉ងទំនិញ</b>\n<b>4. /companyInfo</b> ព័ត៌មានទំនាក់ទំនង", { parse_mode: "HTML" });
    });

    bot.on("message", async (msg) => {
        var id = parseInt(msg.chat.id)
        var text = msg.text
        var voice = msg?.voice
        var sticker = msg?.sticker
        var photo = msg?.photo
        var video = msg?.video
        var contact = msg?.contact
        var location = msg?.location

        let newText = ""
        let typeText = ""

        if (voice !== undefined) {
            newText = voice.file_id
            typeText = "voice"
        } else if (sticker !== undefined) {
            newText = sticker.file_id
            typeText = "sticker"
        } else if (photo !== undefined) {
            newText = photo[0].file_id
            typeText = "photo"
        } else if (video !== undefined) {
            newText = video.file_id
            typeText = "video"
        } else if (text !== undefined) {
            newText = text
            typeText = "text"
        }

        if (newText !== "" && newText[0] !== "/") {
            await axios({
                url: url,
                method: "post",
                data: {
                    query: CHAT,
                    variables: {
                        input: {
                            text: newText,
                            user_id: id,
                            typeText: typeText,
                        }
                    }
                },
            }).then(async(response) => {
                const res = response.data.data.telegramChat
                if (!res.message) {
                    bot.sendMessage(id, "សូមអតិថិជនធ្វើការចុះឈ្មោះសិនមិននឹងចាប់ផ្តើមជជែក!!!\nដោយចុច /register ដើម្បីចុះឈ្មោះ")
                } else {
                    const adminData = await fetchData(FETCH_GET_ADMIN)
                    let user = await fetchDataWithVariable(FETCH_GET_USER, {
                        userId: parseInt(id)
                    })
                    adminData?.getTelegramAdmins?.length && (
                        adminData?.getTelegramAdmins?.map(async load => {
                            bot.sendContact(load.user_id, user?.getTelegramUsers?.phone_number, user?.getTelegramUsers?.first_name).then(() => {
                                bot.sendMessage(load.user_id, "សូមមើលប្រអប់សារ!")
                            })
                        })
                    )
                }
            }).catch(err => {
                console.log(err.message)
            })
        } else if (newText[0] === "/" || contact !== undefined || location !== undefined) {
            return
        } else {
            bot.sendMessage(id, "ការផ្ញើរបស់អ្នកមិនត្រឹមត្រូវនោះទេ")
        }
    });
}