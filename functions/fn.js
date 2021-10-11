export const loginExpireDate = () => {
    //Stop on midnight
    let nextDay = new Date().setDate(new Date().getDate() + 1)
    let nextHour = new Date(new Date(nextDay).setHours(0))
    let today = new Date()
    let loginDate = nextHour.getUTCHours() - today.getUTCHours()

    return loginDate + "h"
}