export const CHAT = `
    mutation ($input: TelegramChatInput) {
        telegramChat(input: $input) {
            data {
                text
                createdAt
            }
            message
        }
    }
`