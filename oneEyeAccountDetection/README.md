# OneEye Account API

 
This Lambda function accepts the customer's Id (sent from DeepLens over IOT topic), fetch customer's account details from DynamoDB and  publish the data to a SNS.


### Requirements

- Create a DynamoDB table name `OneEyeAccountList`  with following columns:

```
accountId <String> <Primary Key>
accountType <String>
address <String>
balance <String>
profilePics <String>
userName <userName>
```

- [Create a HTTP SNS topic and verify it](https://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html) 
 
 After creating these resources update the code with proper information and deploy it on NodeJS Lambda Function.
