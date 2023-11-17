//const AWS = require('aws-sdk');
const { sendResponse } = require("../../responses/index");
const dynamoDB = require("aws-sdk/clients/dynamodb");
const db = new dynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  const { bookings } = JSON.parse(event.body);

  try {
    const params = {
      TableName: "rooms-db",
    };

    //Get data from dynamoDB
    const data = await db.scan(params).promise();

    data.Items.forEach((room) => {
      if (room.booked.length > 0) {
        room.booked.forEach((booking) => {
          bookings.forEach((bookingToDelete, index) => {
            if (
              booking.bookingsnumber === bookingToDelete ||
              booking.email === bookingToDelete
            ) {
              delBook(room.id, index);
              return;
            }
          });
        });
      }
    });

    return sendResponse(200, {
      success: true,
      message: "woop woop. You're all done. EXTERMINATE",
    });
  } catch (err) {
    return sendResponse(500, {
      success: false,
      message: "Misslyckades med att hämta rum från DynamoDB.",
    });
  }
};

//Delete booking from dynamoDB
async function delBook(id, index) {
  const updateParams = {
    TableName: "rooms-db",
    Key: {
      id: id,
    },
    UpdateExpression: "REMOVE booked[" + index + "]",
  };
  try {
    console.log("removing."); //This runs even the first time but the database doesn't update
    await db.update(updateParams, (err) => {
      if (err) {
        console.log("Inside the update with err");
      } else {
        console.log("Inside the update");
      }
    }).promise();
    console.log("after");
  } catch (err) {
    return sendResponse(500, { message: err });
  }
}
