
const { sendResponse } = require('../../responses/index');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    try {
        const bookingDetails = JSON.parse(event.body);
        const { visitors, startDate, endDate } = bookingDetails;

        const currentDate = new Date(); // Get the current date and time

        // Check if the startDate is in the future
        if (new Date(startDate) < currentDate) {
            return sendResponse(400, "Please enter a future date");
        }
        if (new Date(startDate) > new Date(endDate)) {
            return sendResponse(400, "du kan inte resa tbx.");
        }

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

        const availableRooms = Items.filter(room => {
            if (room.booked && room.booked.length > 0) {
                for (const booking of room.booked) {
                    if (
                        (new Date(startDate) >= new Date(booking.startDate) && new Date(startDate) < new Date(booking.endDate)) ||
                        (new Date(endDate) >= new Date(booking.startDate) && new Date(endDate) <= new Date(booking.endDate)) ||
                        (new Date(startDate) <= new Date(booking.startDate) && new Date(endDate) >= new Date(booking.endDate))
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
        return sendResponse(500, "Please enter Date and number of visitors");
    }
};

