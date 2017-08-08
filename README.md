AWS Lambda-MongoDB Atlas Function.

This repository has a Lambda function creating a document into a MongoDB Atlas database.

Note: I included the zip.sh script I use to easily create the archive.zip file to be uploaded to AWS Lambda.

Test instructions

We recommend you use the lambda-local NPM package to test your Lambda function locally with your Atlas cluster.

The ll.sh script allows you to easily run tests by configuring the following parameters:

ATLAS_USERNAME="<username>"
ATLAS_PASSWORD="<password>"
ATLAS_CLUSTER_NAME="<cluster_name>"
ATLAS_CLUSTER_SUFFIX="<cluster_suffix>"
with those parameters feeding into the following connection string format:

mongodb://$ATLAS_USERNAME:$ATLAS_PASSWORD@$ATLAS_CLUSTER_NAME-shard-00-00-$ATLAS_CLUSTER_SUFFIX.mongodb.net:27017,$ATLAS_CLUSTER_NAME-shard-00-01-$ATLAS_CLUSTER_SUFFIX.mongodb.net:27017,$ATLAS_CLUSTER_NAME-shard-00-02-$ATLAS_CLUSTER_SUFFIX.mongodb.net:27017/travel?ssl=true&replicaSet=$ATLAS_CLUSTER_NAME-shard-0&authSource=admin


