//generates random string and exports function
export const generateRandomString = (length) => { 
    let text = ''; 
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
    for (let i = 0; i < length; i++) 
        text += possible.charAt(Math.floor(Math.random() * possible.length)); 
    return text; 
}

export const getCurrentDateTime = () => {
    let currentTime = new Date().toLocaleTimeString( 'en-GB', {hour12: false,
        hour: 'numeric',
        minute: 'numeric'});
    let currentDate = new Date().toLocaleDateString('en-GB');
    return `[${currentTime}]`
}