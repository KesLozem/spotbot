const axios = require('axios');
const { getAuth } = require('../auth_services/store_auth.service');

const putDeviceID = async (req, res) => {
    try {
        let access_token = getAuth();
        let device_id = [req.body.device_id];
        let authOptions = {
            url: `https://api.spotify.com/v1/me/player`,
            method: 'put',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true,
            data: {
                device_ids: device_id,
                play: true
            }
        };
        axios(authOptions)
            .then(function (response) {
                if (response.status === 204) {
                    res.status(204).send(JSON.stringify({'success': 'transferred playback'}));
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    putDeviceID
}