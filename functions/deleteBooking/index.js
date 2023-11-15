//const AWS = require('aws-sdk');
const { sendResponse } = require("../../responses/index");
const dynamoDB = require("aws-sdk/clients/dynamodb");
const db = new dynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  const {bookingID} = JSON.parse(event.body);
  try {
    const params = {
      TableName: "rooms-db",
    };

    const data = await db.scan(params).promise();

    for (let key in data.Items) {
      const item = data.Items[key];
      if (item.booked.length > 0) {
        const index = item.booked.findIndex(
          (book) => book.bookingsnumber === bookingID
        );
        if (index > -1) {
          const updateParams = {
            TableName: "rooms-db",
            Key: {
              id: item.id,
            },
            UpdateExpression: 'REMOVE booked[' + index + ']',
          };
          try {
            await db.update(updateParams, (err) => {
              if (err) {
                
              } else {
                
              }
            }).promise();
          } catch (err) { 
            return sendResponse(500, {message: err});
          }
        }
      }
    }

    return sendResponse(200, { success: true, message: "woop woop. You're all done. EXTERMINATE" });
  } catch (err) {
    console.error("Error:", err);
    return sendResponse(500, {
      success: false,
      message: "Misslyckades med att hämta rum från DynamoDB.",
    });
  }
};
