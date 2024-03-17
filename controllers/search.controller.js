const { search } = require("../services/search_services/search.service");

const searchFor = async (req, res) => {
    try {
        search(req, res);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {searchFor}
