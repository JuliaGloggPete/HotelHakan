const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');

const db = new AWS.DynamoDB.DocumentClient();



exports.handler = async (event, context) => {
    try {
        const params = {
            TableName: 'rooms-db',
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