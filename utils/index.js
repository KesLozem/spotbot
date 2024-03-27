//generates random string and exports function
const generateRandomString = (length) => { 
    let text = ''; 
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
    for (let i = 0; i < length; i++) 
        text += possible.charAt(Math.floor(Math.random() * possible.length)); 
    return text; 
}

const getCurrentDateTime = () => {
    let currentTime = new Date().toLocaleTimeString( 'en-GB', {hour12: false,
        hour: 'numeric',
        minute: 'numeric'});
    let currentDate = new Date().toLocaleDateString('en-GB');
    return `[${currentTime}]`
}

const sleep = (interval) => {
    return new Promise(r => setTimeout(r, interval));
}

const wait_until = async (hour, minute = 0) =>{
    let cur_time = new Date();
    let cur_hours = cur_time.getHours();
    let cur_minutes = cur_time.getMinutes();
    let cur_seconds = cur_time.getSeconds();
    let time_difference = 0;
    if (cur_hours < hour || (cur_hours == hour && cur_minutes < minute)) {
        time_difference += (hour - cur_hours) * 3600
    }  else {
        time_difference += (hour - cur_hours + 24) * 3600
    }
    time_difference += (minute - cur_minutes - 1) * 60
    time_difference += (60 - cur_seconds)

    console.log(time_difference)

    await sleep(time_difference * 1000)

    return 0

}

module.exports = {
    generateRandomString,
    getCurrentDateTime,
    sleep,
    wait_until
}