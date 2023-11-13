function sendResponse(code, response){

return{
    statusCode: code,
    headers:{
        "Content-Type": "application/json"
    },
    body: JSON.stringify(response),
};


}



module.exports = { sendResponse}