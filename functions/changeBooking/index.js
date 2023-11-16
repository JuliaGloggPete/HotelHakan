const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');

const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    try {
        const requestBody = JSON.parse(event.body);
        const { bookingsnumber, visitors: newVisitors, startDate: newStartDate, endDate: newEndDate } = requestBody;

        // Hämta alla rum från databasen
        const params = { TableName: 'rooms-db' };
        const { Items: rooms } = await db.scan(params).promise();

        // Hitta och uppdatera bokningen
        const updatedRooms = rooms.map(room => {
            const updatedBookings = room.booked.map(booking => {
                if (booking.bookingsnumber === bookingsnumber) {
                    // Kolla om det finns tillgängliga rum för de nya datumen och antalet besökare
                    const startDateInRange = new Date(newStartDate) >= new Date(booking.endDate) || new Date(newEndDate) <= new Date(booking.startDate);

                    // Uppdatera bokningen
                    if ((room.type === 'single' && newVisitors !== 1) ||
                        (room.type === 'double' && newVisitors > 2) ||
                        (room.type === 'suite' && newVisitors > 3)) {
                        throw new Error('Invalid number of visitors. Please specify 1, 2, or 3.');
                    }

                    booking.visitors = newVisitors || booking.visitors;
                    booking.startDate = newStartDate || booking.startDate;
                    booking.endDate = newEndDate || booking.endDate;
                    // ... andra fält att uppdatera
                }
                return booking;
            });

            return { ...room, booked: updatedBookings };
        });

        // Spara de uppdaterade rummen tillbaka till databasen
        await Promise.all(updatedRooms.map(updatedRoom => {
            const { id, booked } = updatedRoom;
            const updateParams = {
                TableName: 'rooms-db',
                Key: { id },
                UpdateExpression: 'SET booked = :booked',
                ExpressionAttributeValues: { ':booked': booked },
            };
            return db.update(updateParams).promise();
        }));

        return sendResponse(200, { success: true, message: 'Bokningen uppdaterad framgångsrikt.' });
    } catch (error) {
        console.error('Error:', error);
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || 'Misslyckades med att uppdatera bokningen.';
        return sendResponse(statusCode, { success: false, message: errorMessage });
    }
};
