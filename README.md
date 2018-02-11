# OneEye Face Recognition

Facial recognition is a biometric solution that measures unique characteristics about one’s face. Applications available today include flight checking, tagging friends and family members in photos, and “tailored” advertising.

As part of AWS DeepLens Challenge (#AWSDeepLensChallenge) we have implemented two use cases for face identification solution using DeepLens: First use case is Customer Identification. To satisfy the goal, we used customers’ profile pictures on a system (i.e., Bank) to match with DeepLens face detection results on real time basis when customer enters to a branch. Upon customer identification via DeepLens algorithm, an API call fetches customer's account details and surface the information on Bank's desktop web application. [Here](https://youtu.be/4WFmJTUzjTI) is a demo for customer identification.

Second use case is Amber Alert. We developed a mobile application that takes a picture of a missing person (or wanted person) and uploads it to storage back-end (AWS S3 in this case). As soon as image is uploaded, DeepLens uses this new picture in its face identification algorithm and identifies the person on real time video streaming. When missing person is detected, DeepLens sends a notification via email or phone, whichever is subscribed, to notify the authorities. Here is a demo for Amber Alert use case. [Here](https://youtu.be/zMAzF-suGXY) is a demo for Amber Alert use case.

## How I built it

Face recognition model is built using [dlib](http://dlib.net/)'s state-of-the-art face detection libraries. The model has an accuracy of 99.38% on the Labeled Faces in the Wild benchmark [1](https://github.com/ageitgey/face_recognition). 

Greengrass lambda function runs the face detection algorithm on the DeepLens device and publishes an event to the IOT topic as soon as it identifies a face. There exists another lambda function listening to this topic and fetches customer's info via API call from back-end's database. After data got retrived, this Lambda will publish an event to SNS with customers information as payload. A NodeJs web server (running on EC2) accepts the POST call from SNS and broadcasts a message to all of the clients (web or mobile) registered to it via WebSocket. This architecture allows real time update of the Client application as soon a new customers step into the branch. You can find more information about Customer Identification diagram [Here](https://github.com/medcv/OneEyeFaceDetection/blob/master/deeplensFaceDetection/diagrams/CustomerIdentification.jpg) and Amber Alert diagram [Here](https://github.com/medcv/OneEyeFaceDetection/blob/master/deeplensFaceDetection/diagrams/AmberAlert.jpg)

## Requirements
- AWS DeepLens (Device to stream video and detect faces)
- AWS S3 bucket (to store Profile images )
- AWS DynamoDB Table (to store Customer Account information)
- AWS SNS (to communicate between Client and Back-end)
- AWS Lambda Function
- AWS Greengrass
- NodeJs server
- AngularJs UI Client
 
## Installation

- [Deploy OneEye on AWS DeepLens](https://github.com/medcv/OneEyeFaceDetection/tree/master/deeplensFaceDetection)
- [Deploy Account API on Lambda Function](https://github.com/medcv/OneEyeFaceDetection/tree/master/oneEyeAccountDetection)
- [Run Client Server](https://github.com/medcv/OneEyeFaceDetection/tree/master/oneEyeServer)
