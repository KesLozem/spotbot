// Creates an array of objects to store the access and refresh tokens

const auth_list = [];

const storeAuth = async (req, res) => {
    try {
        auth_list.push(req);
        res.status(200).send(`User ${req.display_name} has been authenticated!`);
        // console.log(auth_list)
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
   storeAuth, 
   auth_list
};