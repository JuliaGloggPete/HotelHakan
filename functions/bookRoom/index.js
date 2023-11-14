//room måste ta in en objekt som har
// namn
// från - till datum
// epost
// bookningsnummer
// och rummets egenskaper




const { sendResponse } = require('../../responses/index');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    try {
        // Parse the request body to get booking information
        const requestBody = JSON.parse(event.body);
        const { id, firstname, email, startDate, endDate, visitors } = requestBody;

        // Check if any of the required fields are empty
        if (!id || !firstname || !email || !startDate || !endDate || !visitors) {
            return sendResponse(400, { success: false, message: "Invalid booking data" });
        }

        // Scan the 'rooms-db' table to find the room with the specified ID
        const { Items } = await db.scan({
            TableName: 'rooms-db',
        }).promise();

        const choosenroom = Items.find((room) => room.id === id);

        if (!choosenroom) {
            return sendResponse(404, { message: 'Room not found' });
        }

        // Generate a unique booking number
        const timestamp2 = new Date().getTime();
        const bookingsnumber = `${timestamp2}`;

        const newBooking = {
            bookingsnumber: bookingsnumber,
            firstname: firstname,
            email: email,
            startDate: startDate,
            endDate: endDate,
            visitors: visitors,
        };

        // Update the room with the new booking
        await db.update({
            TableName: 'rooms-db',
            Key: { id: choosenroom.id },
            UpdateExpression: 'SET #booked = list_append(if_not_exists(#booked, :empty_list), :newBooking)',
            ExpressionAttributeNames: { '#booked': 'booked' },
            ExpressionAttributeValues: {
                ':newBooking': [newBooking],
                ':empty_list': [],
            },
        }).promise();

        return sendResponse(200, { success: true });
    } catch (error) {
        console.error('Error updating item:', error);
        return sendResponse(500, { success: false, message: 'Failed to book the room.' });
    }
};
