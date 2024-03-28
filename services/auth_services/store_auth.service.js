// Creates an array of objects to store the access and refresh tokens

const auth_list = [];
var auth_token = null;

const storeAuth = async (req, res) => {
    try {
        auth_list.push(req);
        res.status(200).send(`User ${req.display_name} has been authenticated!`);
        // console.log(auth_list)
    } catch (error) {
        console.log(error);
    }
}

const getAuth = function () {
    return auth_token;
}

const setAuth = function (token) {
    auth_token = token;
}

const getRefresh = function () {
    try {
        return auth_list[auth_list.length-1].tokens.refresh_token;
    } catch (error) {
        console.log(auth_list)
        return null;
    }
}

module.exports = {
   storeAuth, 
   auth_list,
   getAuth,
   setAuth,
   getRefresh
};