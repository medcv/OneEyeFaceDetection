
var aws = require("aws-sdk");
aws.config.region = 'us-east-1';
module.exports = function() {
    return new aws.DynamoDB({
        region: "us-east-1",
        version: "latest",
        credentials: new aws.Credentials('<ACCESS-KEY>',
            'SECRET-ACCESS-KEY')
    });
};
