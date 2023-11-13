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

    },
    {
        roomnumber: 102, 
        type: "single",
        booked: false,
        price: 500

    },
    {
        roomnumber: 202, 
        type: "double",
        booked: false,
        price: 1000

    },
    {
        roomnumber: 303, 
        type: "suite",
        booked: false,
        price: 1500

    },
    {
        roomnumber: 103, 
        type: "single",
        booked: false,
        price: 500

    },
    {
        roomnumber: 203, 
        type: "double",
        booked: false,
        price: 1000

    },
    {
        roomnumber: 303, 
        type: "suite",
        booked: false,
        price: 1500

    },
    {
        roomnumber: 104, 
        type: "single",
        booked: false,
        price: 500

    },
    {
        roomnumber: 204, 
        type: "double",
        booked: false,
        price: 1000

    },
    {
        roomnumber: 304, 
        type: "suite",
        booked: false,
        price: 1500

    },
   
    {
        roomnumber: 105, 
        type: "single",
        booked: false,
        price: 500

    },
    {
        roomnumber: 205, 
        type: "double",
        booked: false,
        price: 1000

    },
    {
        roomnumber: 305, 
        type: "suite",
        booked: false,
        price: 1500

    },
    {
        roomnumber: 206, 
        type: "double",
        booked: false,
        price: 1000

    },
    {
        roomnumber: 207, 
        type: "double",
        booked: false,
        price: 1000

    },
    {
        roomnumber: 208, 
        type: "double",
        booked: false,
        price: 1000

    },
    {
        roomnumber: 209, 
        type: "double",
        booked: false,
        price: 1000

    },
    {
        roomnumber: 210, 
        type: "double",
        booked: false,
        price: 1000

    },
    
]


exports.handler = async(event, context) =>{

    return sendResponse(200, {rooms});
// this is a comment



}