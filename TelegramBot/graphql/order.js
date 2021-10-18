export const ORDER = `
    mutation ($input: TelegramOrderInput) {
        telegramOrder(input: $input) {
            data {
                id
                text
                geolocation {
                    lat
                    long
                }
            }
        }
    }
`

export const ORDER_UPDATE = `
    mutation ($input: TelegramOrderInput) {
        telegramOrderUpdate(input: $input) {
            data {
                id
                text
                typeText
                geolocation {
                    lat
                    long
                }
            }
        }
    }
`

export const ORDER_DELETE = `
    mutation ($orderId: String) {
        telegramOrderDelete(orderId: $orderId) {
        message
        }
    }
`