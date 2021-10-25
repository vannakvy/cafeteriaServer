import axios from "axios"

export const loginExpireDate = () => {
    //Stop on midnight
    let nextDay = new Date().setDate(new Date().getDate() + 1)
    let nextHour = new Date(new Date(nextDay).setHours(0))
    let today = new Date()
    let loginDate = nextHour.getUTCHours() - today.getUTCHours()

    return loginDate + "h"
}

export const fetchData = async (e) => {
    const data = await axios({
        url: "http://localhost:5000/graphql",
        method: "post",
        data: {
            query: e,
        },
    }).then(response => {
        return response.data.data
    }).catch(err => {
        console.log(err)
    })

    return data
}

export const fetchDataWithVariable = async (e, v) => {
    const data = await axios({
        url: "http://localhost:5000/graphql",
        method: "post",
        data: {
            query: e,
            variables: v
        },
    }).then(response => {
        return response.data.data
    }).catch(err => {
        console.log(err)
    })

    return data
}

export const PostData = async (e, v) => {
    const data = await axios({
        url: "http://localhost:5000/graphql",
        method: "post",
        data: {
            query: e,
            variables: v
        },
    }).then(response => {
        return response.data.data
    }).catch(err => {
        console.log(err)
    })

    return data
}

export function convertTZ(date) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));   
}

export function convertQueryDate(date){
    let hour = new Date(date).getHours()
    let minute = new Date(date).getMinutes()
    let second = new Date(date).getSeconds()

    return new Date(new Date(new Date(new Date(date).setHours(hour)).setMinutes(minute)).setSeconds(second))
}