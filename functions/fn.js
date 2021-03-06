import axios from "axios"
import { Expo } from 'expo-server-sdk';

import dotenv from 'dotenv'
import moment from "moment";

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
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
}

export function convertQueryDate(date) {
    let hour = new Date(date).getHours()
    let minute = new Date(date).getMinutes()
    let second = new Date(date).getSeconds()

    return new Date(new Date(new Date(new Date(date).setHours(hour)).setMinutes(minute)).setSeconds(second))
}

export const PushSingleNotification = async (data) => {
    dotenv.config()
    let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
    let messages = [data];

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            //   console.log(ticketChunk);
            tickets.push(...ticketChunk);
            // NOTE: If a ticket contains an error code in ticket.details.error, you
            // must handle it appropriately. The error codes are listed in the Expo
            // documentation:
            // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
        } catch (error) {
            console.error(error);
        }
    }
}

export const marge2Array = (arr1, arr2, arrKey) => {
    // var array = arr1.concat(arr2).reduce((acc, x) => {
    //     acc[x._id] = Object.assign(acc[x._id] || {}, x);
    //     return acc;
    // }, {});
    // const newArray = Object.values(array).map(({_id, ...keepAttrs}) => keepAttrs);
    // console.log(newArray)
    // return array

    var array = [...arr1, ...arr2].reduce((acc, val, ind) => {
        const index = acc.findIndex(el => el._id.toString() === val._id.toString());
        if (index !== -1) {
           const key = Object.keys(val)[arrKey];
           acc[index][key] = val[key];
        } else {
           acc.push(val);
        };
        return acc;
     }, []);

     return array
}

export function getDayOfMonth(e) {
    // let startDate = new Date(moment(e).startOf('month').set({ 'hour': 0, 'minute': 0, "second": 1 }));
    // let endDate = new Date(moment(e).endOf('month').set({ 'hour': 23, 'minute': 59, "second": 59 }));

    let startDate = moment(e).startOf('month').set({ 'hour': 0, 'minute': 0, "second": 1 });
    let endDate = moment(e).endOf('month').set({ 'hour': 23, 'minute': 59, "second": 59 });

    return { startDate: startDate, endDate: endDate }
}

export function getDayOfYear(e) {
    // let startDate = new Date(moment(e).startOf('month').set({ 'hour': 0, 'minute': 0, "second": 1 }));
    // let endDate = new Date(moment(e).endOf('month').set({ 'hour': 23, 'minute': 59, "second": 59 }));

    let startDate = moment(e).startOf('year').set({ 'hour': 0, 'minute': 0, "second": 1 });
    let endDate = moment(e).endOf('year').set({ 'hour': 23, 'minute': 59, "second": 59 });

    return { startDate: startDate, endDate: endDate }
}

export function getLastMonthCode(e) {
    let lastMonth = moment(e).month() - 1
    return moment(e).month(lastMonth).format("MMM-YYYY")
}

export function getDayOfDay(day) {

    var e = moment().set({ 'date': day, 'month': moment().month(), 'year': moment().year() })
    let startDate = new Date(moment(e).startOf('date'));
    let endDate = new Date(moment(e).endOf('date'));

    return { startDate: startDate, endDate: endDate }
}

export function getStartTimeOfDate(e){
    return moment(e).set({ 'hour': 0, 'minute': 0, "second": 1 });
}
export function getEndTimeOfDate(e){
    return moment(e).set({ 'hour': 23, 'minute': 59, "second": 59 });

}
