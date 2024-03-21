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

module.exports = {
    generateRandomString,
    getCurrentDateTime,
    sleep
}