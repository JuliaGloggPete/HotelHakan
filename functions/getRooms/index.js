const {sendResponse} = require('../../responses/index');

var rooms = [
    {
        roomnumber: 101, 
        type: "single",
        booked: false,
        price: 500

    },
    {
        roomnumber: 201, 
        type: "double",
        booked: false,
        price: 1000

    },
    {
        roomnumber: 301, 
        type: "suite",
        booked: false,
        price: 1500

    }
]


exports.handler = async(event, context) =>{

    return sendResponse(200, {rooms});




}