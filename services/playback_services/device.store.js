var device_id = null;

const setDeviceId = (id) => {
    device_id = id;
}

const getDeviceId = () => {
    // Return device ID if it has been set
    if (!device_id) {
        return device_id;
    } else {
        throw "No ID set";
    }
}

module.exports = {
    setDeviceId,
    getDeviceId
}