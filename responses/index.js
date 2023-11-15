
function sendResponse(code, response){
    return{
        statusCode: code,
        headers: {
            "Content-Type": "applicaiton/json",
            "Access-Control-Allow-Origin": "*", 
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH", 
            "Access-Control-Allow-Headers": "Content-Type, Authorization", 
                },
        body: JSON.stringify(response),

    };
}

module.exports = {sendResponse}