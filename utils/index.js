//generates random string and exports function
const generateRandomString = (length) => { 
    let text = ''; 
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
    for (let i = 0; i < length; i++) 
        text += possible.charAt(Math.floor(Math.random() * possible.length)); 
    return text; 
}

const generateRoomPin = () => {
    return Math.floor(1000 + Math.random() * 9000);
}

module.exports = generateRandomString;
module.exports = generateRoomPin;
