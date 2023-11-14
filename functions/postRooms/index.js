const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    const rooms = JSON.parse(event.body);

    // detta behöver mer logik så man inte kan posta vad som helst
    
    if (!rooms.type || !rooms.booked || !rooms.price || !rooms.roomnumber) {
        return sendResponse(400, { success: false, message: "Invalid booking data. You need type, booked, price, and roomnumber." });
    }
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