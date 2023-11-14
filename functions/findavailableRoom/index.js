const { sendResponse } = require('../../responses/index');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    try {
        const bookingDetails = JSON.parse(event.body);
        const { visitors, startDate, endDate } = bookingDetails;

        //här kan vi ju teoretiskt göra så att den spotta ut en doubelroom om alla
        //singel room är bookad o jag är bara 1, osv

        let roomType;
        if (visitors === 1) {
            roomType = "single";
        } else if (visitors === 2) {
            roomType = "double";
        } else if (visitors === 3) {
            roomType = "suite";
        } else {
            return sendResponse(400, "Invalid number of visitors. Please specify 1, 2, or 3.");
        }

        const params = {
            TableName: 'rooms-db',
            FilterExpression: "#type = :roomType",
            ExpressionAttributeNames: {
                "#type": "type"
            },
            ExpressionAttributeValues: {
                ":roomType": roomType
            }
        };

        const { Items } = await db.scan(params).promise();

        // Filter rooms without collisions
       
        // ska även inte gå att boka in the past tycker jag men då måste jag veta formatet
        const availableRooms = Items.filter(room => {
            if (room.booked && room.booked.length > 0) {
                for (const booking of room.booked) {
                    if (
                        (startDate >= booking.startDate && startDate < booking.endDate) ||
                        (endDate >= booking.startDate && endDate <= booking.endDate) ||
                        (startDate <= booking.startDate && endDate >= booking.endDate)
                    ) {
                        return false; 
                    }
                }
            }
            return true; 
        });

        return sendResponse(200, availableRooms);
    } catch (error) {
        console.error("Error:", error);
        return sendResponse(500, "something is off");
    }
};





/*
const { sendResponse } = require('../../responses/index');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    try {
        // Assuming the request body contains the booking details
        const bookingDetails = JSON.parse(event.body);

        const { visitors, startDate, endDate } = bookingDetails;

        let roomType;
        if (visitors === 1) {
            roomType = "single";
        } else if (visitors === 2) {
            roomType = "double";
        } else if (visitors === 3) {
            roomType = "suite";
        } else {
            return sendResponse(400, "Invalid number of visitors. Please specify 1, 2, or 3.");
        }

        const params = {
            TableName: 'rooms-db',
            FilterExpression: "#type = :roomType",
            ExpressionAttributeNames: {
                "#type": "type"
            },
            ExpressionAttributeValues: {
                ":roomType": roomType
            }
        };

        const { Items } = await db.scan(params).promise();

        return sendResponse(200, Items);
    } catch (error) {
        console.error("Error:", error);
        return sendResponse(500, "Internal Server Error");
    }
};









/*
const { sendResponse } = require('../../responses/index');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {

    const {Items} = await db.scan({TableName: 'rooms-db'}). promise();

    /* I want to send an object to this get 
      "firstname": "John Doe",
    "email": "johndoe@example.com",
    "visitors": 1 // or 2// or 3// or bigger then 3
    "startDate": "2023-11-15",
    "endDate": "2023-11-18"

    and for the first step I only want to get the objects back how 
     play accordingly to the visitors - if visitors: 1 I want to get back all 
     rooms with the type "single", if 2 all rooms with the type double and if 3 all rooms with the type suite


    Here I want to get the ITems a
    

try {
    const params = {
        TableName: 'rooms-db',
        FilterExpression: "#type = :roomType AND size(#booked) = :numVisitors AND (#booked[0].endDate < :startDate OR #booked[0].startDate > :endDate)",
        ExpressionAttributeNames: {
          "#type": "type",
          "#booked": "booked"
        },
        ExpressionAttributeValues: {
          ":roomType": "single", // Replace with the desired room type
          ":numVisitors": 1, // Replace with the desired number of visitors
          ":startDate": "2023-11-15", // Replace with the desired start date
          ":endDate": "2023-11-18" // Replace with the desired end date
        }
      };

      const result = await db.scan(params).promise();

      if (result.Items && result.Items.length > 0) {
          return sendResponse(200, { rooms: result.Items });
      } else {
          return sendResponse(404, { message: 'Inga rum hittades.' });
      }
  } catch (error) {
      console.error('Error:', error);
      return sendResponse(500, { success: false, message: 'Misslyckades med att hämta rum från DynamoDB.' });
  }
}
*/