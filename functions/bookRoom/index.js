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

        const requestBody = JSON.parse(event.body);
        const { id, firstname, email, startDate, endDate, visitors } = requestBody;

        // Check if any of the required fields are empty
        if (!id || !firstname || !email || !startDate || !endDate || !visitors) {
            return sendResponse(400, { success: false, message: "Invalid booking data" });
        }

        const { Items } = await db.scan({
            TableName: 'rooms-db',
        }).promise();

        const choosenroom = Items.find((room) => room.id === id);

        if (!choosenroom) {
            return sendResponse(404, { message: 'Room not found' });
        }

        //tanken är att man i theorie öven kan booka en double som en .. 
        //tänker jag just nu fast till samma pris KACHING!

        if (
            (choosenroom.type === "single" && visitors !== 1) ||
            (choosenroom.type === "double" && visitors > 2) ||
            (choosenroom.type === "suite" && visitors > 3)
        ) {
            return sendResponse(400, { success: false, message: "Invalid number of visitors. Please specify 1, 2, or 3." });
        }


      

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
        const currentDate = new Date(); 
        if (new Date(startDate) < currentDate) {
            return sendResponse(400, "Please enter a future date");
        }
        if (new Date(startDate) > new Date(endDate)) {
            return sendResponse(400, "du kan inte resa tbx.");
        }

        const visitStartDate = new Date(startDate);
        const visitEndDate = new Date(endDate);

        // Calculate the length of the stay in days
        const visitLength = Math.floor((visitEndDate - visitStartDate) / (1000 * 60 * 60 * 24));
//choosenroom.type === "single"
        let totalPrice;
        switch (choosenroom.type) {
          case 'single':
            totalPrice = visitLength * 500;
            break;
          case 'double':
            totalPrice = visitLength * 1000;
            break;
          case 'suite':
            totalPrice = visitLength * 1500;
            break;
          default:
            totalPrice = 0;
        }


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




        return sendResponse(200, { success: true, newBooking, choosenroom, price:  totalPrice });
    } catch (error) {
        console.error('Error updating item:', error);
        return sendResponse(500, { success: false, message: 'Failed to book the room.' });
    }
};
