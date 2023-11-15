const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {

    const params = {
        TableName: 'rooms-db',
        };

    try {

        // Get all items
        const result = await db.scan(params).promise();

        // Filter out all rooms that are contains booked
        const bookedRooms = result.Items.filter(item => item.booked.length > 0)

        // Checks if there is any booked room and then returns a response
        if (bookedRooms.length > 0) {
            return sendResponse(200, { rooms: bookedRooms });
        } else {
            return sendResponse(404, { message: 'Inga rum hittades.' });
        }

        // Catches any errors and returns a response message
    } catch (error) {
        return sendResponse(500, { success: false, message: 'Misslyckades med att hämta rum från DynamoDB.' });
    }
}