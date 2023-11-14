const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');

const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    try {
        const requestBody = JSON.parse(event.body);
        const bookingsnumber = requestBody.bookingsnumber;

        // Hämta alla rum från databasen
        const params = {
            TableName: 'rooms-db',
        };
        const result = await db.scan(params).promise();

        // Hitta och uppdatera bokningen
        const updatedRooms = result.Items.map(room => {
            const updatedBookings = room.booked.map(booking => {
                if (booking.bookingsnumber === bookingsnumber) {
                    // Uppdatera bokningen här, till exempel ändra antal besökare eller datum
                    booking.visitors = requestBody.visitors || booking.visitors;
                    booking.startDate = requestBody.startDate || booking.startDate;
                    booking.endDate = requestBody.endDate || booking.endDate;
                    // ... andra fält att uppdatera
                }
                return booking;
            });

            return {
                ...room,
                booked: updatedBookings,
            };
        });

        // Spara de uppdaterade rummen tillbaka till databasen
        await Promise.all(updatedRooms.map(updatedRoom => {
            const updateParams = {
                TableName: 'rooms-db',
                Key: { id: updatedRoom.id },
                UpdateExpression: 'SET booked = :booked',
                ExpressionAttributeValues: { ':booked': updatedRoom.booked },
            };
            return db.update(updateParams).promise();
        }));

        return sendResponse(200, { success: true, message: 'Bokningen är uppdaterad!' });
    } catch (error) {
        console.error('Error:', error);
        return sendResponse(500, { success: false, message: 'Misslyckades med att uppdatera bokningen.' });
    }
};
