'use strict'
const AWS = require('aws-sdk');

var MongoClient = require('mongodb').MongoClient;

let atlas_connection_uri;

let cachedDb = null;

exports.handler = (event, context, callback) => {
    var uri = process.env['MONGODB_ATLAS_CLUSTER_URI'];

    if (atlas_connection_uri != null) {
        processEvent(event, context, callback);
    }
    else {
        const kms = new AWS.KMS();
        kms.decrypt({ CiphertextBlob: new Buffer(uri, 'base64') }, (err, data) => {
            if (err) {
                console.log('Decrypt error:', err);
                return callback(err);
            }
            atlas_connection_uri = data.Plaintext.toString('ascii');
            processEvent(event, context, callback);
        });
    }

};

function processEvent(event, context, callback) {
    console.log('Calling MongoDB Atlas from AWS Lambda with event: ' + JSON.stringify(event));
    var sensorArr = JSON.parse(JSON.stringify(event));
    console.log(sensorArr);
    for (var sensor in sensorArr) {
        console.log(i);
        var tempSensorObject = new TempreatureSensor(sensor.sensorID, sensor.sensorName, sensor.sensorState, sensor.tempreature);

        var tempSensorJsonObject = JSON.parse(JSON.stringify(tempSensorObject));

        //the following line is critical for performance reasons to allow re-use of database connections across calls to this Lambda function and avoid closing the database connection. The first call to this lambda function takes about 5 seconds to complete, while subsequent, close calls will only take a few hundred milliseconds.
        context.callbackWaitsForEmptyEventLoop = false;
        
        try {
            //testing if the database connection exists and is connected to Atlas so we can try to re-use it
            if (cachedDb && cachedDb.serverConfig.isConnected()) {
                createDoc(cachedDb, tempSensorJsonObject, callback);
            }
            else {
                //some performance penalty might be incurred when running that database connection initialization code
                console.log(`=> connecting to database ${atlas_connection_uri}`);
                MongoClient.connect(atlas_connection_uri, function (err, db) {
                    if (err) {
                        console.log(`the error is ${err}.`, err)
                        process.exit(1)
                    }
                    cachedDb = db;
                    return createDoc(db, tempSensorJsonObject, callback);
                });            
            }
        }
        catch (err) {
            console.error('an error occurred', err);
        }
    }
}

function TempreatureSensor(sensorID, sensorName, sensorState, tempreature) {
    this.sensorID = sensorID;
    this.sensorName = sensorName;
    this.sensorState = sensorState;
    this.tempreature = tempreature;
    this.lastModifiedDate = new Date();
}

function createDoc(db, json, callback) {
    db.collection('TempreatureSensor').insertOne(json, function (err, result) {
        if (err != null) {
            console.error("an error occurred in createDoc", err);
            callback(null, JSON.stringify(err));
        }
        else {
            var message = `Kudos! You just created an entry into the TempreatureSensor collection with id: ${result.insertedId}`;
            console.log(message);
            callback(null, message);
        }
        //we don't want to close the connection since we set context.callbackWaitsForEmptyEventLoop to false (see above)
        //this will let our function re-use the connection on the next called (if it can re-use the same Lambda container)
        //db.close();
    });
};