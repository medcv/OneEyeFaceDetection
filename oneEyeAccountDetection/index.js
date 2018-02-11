'use strict';

/**
 * This is a sample Lambda function that fetch a Customer's account details from DynamoDB based on
 * customer ID and publish the results to a SNS Topic 
 * 
 *
 */
 
var AWS = require('aws-sdk');
var dynamodb = require("./dynamodb")();
let setList = new Set();

var sns = new AWS.SNS();


 
function clearSetList(arg) {
  setList = new Set();
}

setTimeout(clearSetList, 3000, setList);



exports.handler = (event, context, callback) => {
    
    console.log('Received event:', event.FaceName);
    var accountId = (event.FaceName === undefined ? 'No-Name-passed' : event.FaceName);
   
  console.log('Received event:', JSON.stringify(event, null, 2));
    console.log("++++++++++++"+event.FaceName+"++++++++++++");

    var params = {
        "RequestItems": {
            "OneEyeAccountList": {
                "Keys":[
                    {"accountId": {"S":accountId}}
                ]
            }
        }
    };
    
    console.log(setList)
    

    dynamodb.batchGetItem(params, function (err, data) {
        console.log(err);
        if (err)console.error("Error in saving waitTimes for pre-population");
        console.log(data)
        sns.publish({
            TargetArn:'<SNS TOPIC ARN>', 
            Message:JSON.stringify(data), 
            Subject: "AccountInfo"}, 
            function(err,data){
            if (err){
                console.log("Error sending a message "+err);
                }else{
               console.log("Sent message: "+data.MessageId);
        
                     }
         });
      callback(null, data);

    });

     setList.add(accountId)
    

};
