const { create } = require("../services/playlist_services/create.service")

const newPlaylist = async (req, res) => {
    try {
        create(req, res);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    newPlaylist
}