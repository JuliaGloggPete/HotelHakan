const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    const rooms = JSON.parse(event.body);

    const timestamp = new Date().getTime();

    rooms.id = `${timestamp}`;
 
    try {
        await db.put({
            TableName: 'rooms-db',
            Item: rooms
        }).promise()

        return sendResponse(200, {success: true, body: rooms});
    } catch (error) {
        return sendResponse(500, {success: false, message: "Room not added, something went wrong"});
    }
}