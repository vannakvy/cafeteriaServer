export const REGISTER = `
    mutation ($input: TelegramRegInput) {
        telegramRegister(input: $input) {
            data {
                id
                phone_number
                first_name
                last_name
                user_id
                createdAt
            }
            message
        }
    }
`

export const USER_UPDATE = `
    mutation ($input: TelegramUserInput) {
        telegramUserUpdate(input: $input) {
            data {
                id
            }
            message
        }
    }
`

export const FETCH_GET_ADMIN = `
    query {
        getTelegramAdmins {
            user_id
        }
    }
`

export const FETCH_GET_USER = `
    query ($userId: Int!) {
        getTelegramUsers(user_id: $userId) {
            id
            phone_number
            first_name
        }
    }
`
