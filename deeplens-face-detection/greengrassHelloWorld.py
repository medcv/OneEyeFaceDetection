#
# Copyright Yazdan Shirvany
#

import os
import greengrasssdk
from threading import Timer
import time
import awscam
import cv2
from threading import Thread
import face_recognition
import urllib
import boto3
import scipy.misc
import threading

import schedule

# Creating a greengrass core sdk client
client = greengrasssdk.client('iot-data')

# The information exchanged between IoT and clould has 
# a topic and a message body.
# This is the topic that this code uses to send messages to cloud
iotTopic = '$aws/things/{}/infer'.format(os.environ['AWS_IOT_THING_NAME'])

ret, frame = awscam.getLastFrame()
ret,jpeg = cv2.imencode('.jpg', frame) 
Write_To_FIFO = True

# if you configes AWS CLI on your DeepLen you can remove this
clientS3 = boto3.client(
    's3',
    aws_access_key_id='<AWSD ACCESS KEY>',
    aws_secret_access_key='<AWS SECRET ACCESS KEY>'
)


bucket='one-eye-faces'
response = clientS3.list_objects(
    Bucket=bucket
)

filesUrl = []
images = []

for c in response['Contents']:
    filesUrl.append(c['Key'])


def load_image_url(bucket, filesToLoad, newFile):
    global filesUrl
    for url in filesToLoad:
	print( "https://s3.amazonaws.com/" + bucket +"/"+url)  
        file = urllib.urlopen("https://s3.amazonaws.com/" + bucket +"/"+url)
        img = scipy.misc.imread(file, mode='RGB')
        images.append(face_recognition.face_encodings(img)[0])
	if (newFile):
            filesUrl.append(url)	


# Load a sample picture and learn how to recognize it.
load_image_url(bucket, filesUrl, 0)
client.publish(topic=iotTopic, payload="images are loaded from s3")


def loadS3Images():
    filesUrlNew = []
    global filesUrl
    global images
    bucket='one-eye-faces'
    try:
	client.publish(topic=iotTopic, payload="loading new S3")
        response = clientS3.list_objects(Bucket=bucket)
        for c in response['Contents']:
            filesUrlNew.append(c['Key'])
        
        diff = set(filesUrlNew) - set(filesUrl)
        print (filesUrlNew)
        print (filesUrl)
        print (diff)
	print len(images)
        if len(diff) > 0:
            # Load a sample picture and learn how to recognize it.
            load_image_url(bucket, diff, 1)
	    print len(images)	
            client.publish(topic=iotTopic, payload="load new images from s3")
    except Exception as e:
        msg = "Load S3 failed: " + str(e)
        client.publish(topic=iotTopic, payload=msg)

class FIFO_Thread(Thread):
    def __init__(self):
        ''' Constructor. '''
        Thread.__init__(self)
 
    def run(self):
        fifo_path = "/tmp/results.mjpeg"
        if not os.path.exists(fifo_path):
            os.mkfifo(fifo_path)
        f = open(fifo_path,'w')
        client.publish(topic=iotTopic, payload="Opened Pipe")
        while Write_To_FIFO:
            try:
                f.write(jpeg.tobytes())
            except IOError as e:
                continue  

def greengrass_infinite_infer_run():
    try:
    	global filesUrl
    	global images
	schedule.every(30).seconds.do(loadS3Images)
       	input_width = 300
        input_height = 300

        # Send a starting message to IoT console
        client.publish(topic=iotTopic, payload="Face detection starts now")
        prob_thresh = 0.25
        results_thread = FIFO_Thread()
        results_thread.start()
        
        # Load model to GPU (use {"GPU": 0} for CPU)
        mcfg = {"GPU": 0}
        client.publish(topic=iotTopic, payload="Model loaded")
        ret, frame = awscam.getLastFrame()
        if ret == False:
            raise Exception("Failed to get frame from the stream")
           

        doInfer = True
        yscale = float(frame.shape[0]/input_height)
        xscale = float(frame.shape[1]/input_width)
       

        # Initialize some variables
        face_locations = []
        face_encodings = []
        face_names = []
        process_this_frame = True

        while True:

	    schedule.run_pending()
    	    time.sleep(1)
            # Grab a single frame of video
            ret, frame = awscam.getLastFrame()
            # Raise an exception if failing to get a frame
            if ret == False:
                raise Exception("Failed to get frame from the stream")
                
            # Resize frame of video to 1/4 size for faster face recognition processing
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)

            # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
            rgb_small_frame = small_frame[:, :, ::-1]

            # Only process every other frame of video to save time
            if process_this_frame:
                # Find all the faces and face encodings in the current frame of video
                face_locations = face_recognition.face_locations(rgb_small_frame)
                face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

                face_names = []
                for face_encoding in face_encodings:
                    # See if the face is a match for the known face(s)
                    match = face_recognition.compare_faces(images, face_encoding)
                    name = "Unknown"
                    for index, item in enumerate(filesUrl):
                        if (match[index] == True):
                            name = filesUrl[index]
                            

                    face_names.append(name)
                    msg = '{{"FaceName": "{}"}}'.format(str(name))
                    client.publish(topic=iotTopic, payload = msg)

            process_this_frame = not process_this_frame
            # Display the results
            for (top, right, bottom, left), name in zip(face_locations, face_names):
                # Scale back up face locations since the frame we detected in was scaled to 1/4 size
                top *= 4
                right *= 4
                bottom *= 4
                left *= 4
                font = cv2.FONT_HERSHEY_SIMPLEX
                cv2.putText(frame, name, (left + 6, bottom - 6), font, 0.5, (255, 165, 20), 4)
                
            global jpeg
            ret,jpeg = cv2.imencode('.jpg', frame)
            
    except Exception as e:
        msg = "Test failed: " + str(e)
        client.publish(topic=iotTopic, payload=msg)

    # Asynchronously schedule this function to be run again in 15 seconds
    Timer(15, greengrass_infinite_infer_run).start()


# Execute the function above
greengrass_infinite_infer_run()



# This is a dummy handler and will not be invoked
# Instead the code above will be executed in an infinite loop for our example
def function_handler(event, context):
    return
