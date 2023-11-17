const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');

const db = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event, context) => {
    try {
        const requestBody = JSON.parse(event.body);
        const {
            bookingsnumber,
            visitors: newVisitors,
            startDate: newStartDate,
            endDate: newEndDate,
            newRoomType
        } = requestBody;

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

            const currentDate = new Date();
            if (new Date(newStartDate) < currentDate) {
                throw new Error('Please enter a future date');
            }

            if (new Date(newStartDate) > new Date(newEndDate)) {
                throw new Error('You cannot travel back in time.');
            }

            //Om det inte är samma bokningsnummer, kolla om det finns andra bokningar som krockar med de nya datumen. 
            if (!startDateInRange) {
                const otherBookings = room.booked.filter(otherBooking => otherBooking.bookingsnumber !== bookingsnumber);
                for (const otherBooking of otherBookings) {
                    if (
                        (new Date(newStartDate) >= new Date(otherBooking.startDate) && new Date(newStartDate) < new Date(otherBooking.endDate)) ||
                        (new Date(newEndDate) >= new Date(otherBooking.startDate) && new Date(newEndDate) <= new Date(otherBooking.endDate)) ||
                        (new Date(newStartDate) <= new Date(otherBooking.startDate) && new Date(newEndDate) >= new Date(otherBooking.endDate))
                    ) {
                        throw new Error('The room is already booked for the specified dates.');
                    }
                }
            }

            // Om ny rumstyp finns, uppdatera den
            if (newRoomType && newRoomType !== room.type) {
                // Här kan du implementera logiken för att byta till ett annat rum om det är nödvändigt
                const newRoom = rooms.find(r => r.type === newRoomType && r.capacity >= newVisitors && r.id !== room.id && !r.booked.some(b => (
                    (new Date(newStartDate) >= new Date(b.startDate) && new Date(newStartDate) < new Date(b.endDate)) ||
                    (new Date(newEndDate) >= new Date(b.startDate) && new Date(newEndDate) <= new Date(b.endDate)) ||
                    (new Date(newStartDate) <= new Date(b.startDate) && new Date(newEndDate) >= new Date(b.endDate))
                )));
                
                if (!newRoom) {
                    throw new Error(`No available rooms of type ${newRoomType} for the specified dates and number of visitors.`);
                }

                // Implementera logik för att flytta bokningen till det nya rummet
                const updatedBookings = room.booked.filter(b => b.bookingsnumber !== bookingsnumber);
                
                // Uppdatera den aktuella bokningen med det nya rum-ID:et och typen
                const updatedBooking = {
                    ...booking,
                    roomId: newRoom.id,
                    type: newRoom.type,
                };

                // Lägg till den uppdaterade bokningen i det nya rummet
                newRoom.booked.push(updatedBooking);

                // Lägg till det nya rummet i den uppdaterade rumlistan
                room = newRoom;
                room.booked = newRoom.booked;
                
                // Returnera det uppdaterade rummet
                return { ...room, booked: updatedBookings };
            }

            // Om ingen ny rumstyp, bara uppdatera den aktuella bokningen
            booking.visitors = newVisitors || booking.visitors;
            booking.startDate = newStartDate || booking.startDate;
            booking.endDate = newEndDate || booking.endDate;
        }
        return booking;
    });

    return { ...room, booked: updatedBookings };
});


        // Spara de uppdaterade rummen tillbaka till databasen
        await Promise.all(updatedRooms.map(updatedRoom => {
            const { id, booked, type } = updatedRoom;
            const updateParams = {
                TableName: 'rooms-db',
                Key: { id },
                UpdateExpression: 'SET booked = :booked, #t = :type',
                ExpressionAttributeValues: { ':booked': booked, ':type': type },
                ExpressionAttributeNames: { '#t': 'type' } // 'type' är ett reserverat ord i DynamoDB, använd ExpressionAttributeNames för att undvika problem
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
