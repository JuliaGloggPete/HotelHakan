const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');

const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    try {
        const requestBody = JSON.parse(event.body);
        const bookingsnumber = requestBody.bookingsnumber;
        const newVisitors = requestBody.visitors;
        const newStartDate = requestBody.startDate;
        const newEndDate = requestBody.endDate;

        // Hämta alla rum från databasen
        const params = {
            TableName: 'rooms-db',
        };
        const result = await db.scan(params).promise();

        // Hitta och uppdatera bokningen med hänsyn till tillgänglighet
        const updatedRooms = result.Items.map(room => {
            const updatedBookings = room.booked.map(booking => {
                if (booking.bookingsnumber === bookingsnumber) {
                    // Kolla om det finns tillgängliga rum för de nya datumen och antalet besökare
                    if (isRoomAvailable(room, newStartDate, newEndDate, newVisitors)) {
                        // Uppdatera bokningen
                        booking.visitors = newVisitors || booking.visitors;
                        booking.startDate = newStartDate || booking.startDate;
                        booking.endDate = newEndDate || booking.endDate;
                        // ... andra fält att uppdatera
                    } else {
                        throw new Error('Inga tillgängliga rum för de nya datumen eller antalet besökare.');
                    }
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

        return sendResponse(200, { success: true, message: 'Bokningen uppdaterad framgångsrikt.' });
    } catch (error) {
        console.error('Error:', error);
        return sendResponse(500, { success: false, message: 'Misslyckades med att uppdatera bokningen.' });
    }
};

// Hjälpmetod för att kontrollera om det finns tillgängliga rum för de nya datumen och antalet besökare
function isRoomAvailable(room, newStartDate, newEndDate, newVisitors) {
    // Om rummet inte är bokat alls, anses det vara tillgängligt
    if (room.booked.length === 0) {
        return true;
    }

    // Om rummet är bokat, kontrollera kapacitet och datumen
    const roomCapacity = getRoomCapacity(room.type);
    if (roomCapacity >= newVisitors) {
        // Kontrollera om rummet är tillgängligt under de nya datumen
        return room.booked.every(booking => {
            const startDateInRange = new Date(newStartDate) >= new Date(booking.endDate) || new Date(newEndDate) <= new Date(booking.startDate);
            return startDateInRange;
        });
    }

    return false;
}

// Hjälpmetod för att hämta rummets kapacitet baserat på rumstypen
function getRoomCapacity(roomType) {
    switch (roomType) {
        case 'single':
            return 1;
        case 'double':
            return 2;
        case 'suite':
            return 3;
        default:
            return 0; 
    }
}
