#!/bin/sh
usage()
{
    echo "Usage: deploy [--us-east-1 <us-east-1 Artefact Bucket Name>] [--us-west-2 <us-west-2 Artefact Bucket Name>]"
    echo "Example: deploy --us-east-1 artefactbucketuseast1 --us-west-2 artefactbucketuswest2"
}

while [ "$1" != "" ]; do
    case $1 in
        --us-east-1 )   shift
                        region1s3bucket="$1"
                        ;;
        --us-west-2 )   shift
                        region2s3bucket="$1"
                        ;;
        -h | --help )           usage
                                exit
                                ;;
        * )                     usage
                                exit 1
    esac
    shift
done

if [ -n "$region1s3bucket" ] && [ -n "$region2s3bucket" ]
then
    echo "Uploading artefact files to "$region1s3bucket" and "$region2s3bucket"..."
    sed -i '' 's/Region1LambdaCodeS3Bucket/'$region1s3bucket'/g' stack-lambdas.yml
    if [ $? != 0 ]; then echo "Error editing stack-lambdas.yml to include Region 1 S3 Bucket Name"; exit 1; fi
    sed -i '' 's/Region2LambdaCodeS3Bucket/'$region2s3bucket'/g' stack-lambdas.yml 
    if [ $? != 0 ]; then echo "Error editing stack-lambdas.yml to include Region 2 S3 Bucket Name"; exit 1; fi
    aws s3 cp stack-lambdas.yml s3://$region1s3bucket/ --region us-east-1
    if [ $? != 0 ]; then echo "Error uploading stack-lambdas.yml to Region 1 S3 Bucket. Please confirm inputs are valid and suitable AWS CLI credentials are configured to perform uploads to S3 buckets."; exit 1; fi
    aws s3 cp dashboard-lambda.zip s3://$region1s3bucket/ --region us-east-1
    if [ $? != 0 ]; then echo "Error uploading dashboard-lambda.zip to Region 1 S3 Bucket. Please confirm inputs are valid and suitable AWS CLI credentials are configured to perform uploads to S3 buckets."; exit 1; fi
    aws s3 cp failover-lambda.zip s3://$region1s3bucket/ --region us-east-1
    if [ $? != 0 ]; then echo "Error uploading failover-lambda.zip to Region 1 S3 Bucket. Please confirm inputs are valid and suitable AWS CLI credentials are configured to perform uploads to S3 buckets."; exit 1; fi
    aws s3 cp js-sdk-2.958.zip s3://$region1s3bucket/ --region us-east-1
    if [ $? != 0 ]; then echo "Error uploading js-sdk-2.958.zip to Region 1 S3 Bucket. Please confirm inputs are valid and suitable AWS CLI credentials are configured to perform uploads to S3 buckets."; exit 1; fi
    aws s3 cp dashboard-lambda.zip s3://$region2s3bucket/ --region us-west-2
    if [ $? != 0 ]; then echo "Error uploading dashboard-lambda.zip to Region 2 S3 Bucket. Please confirm inputs are valid and suitable AWS CLI credentials are configured to perform uploads to S3 buckets."; exit 1; fi
    aws s3 cp failover-lambda.zip s3://$region2s3bucket/ --region us-west-2
    if [ $? != 0 ]; then echo "Error uploading failover-lambda.zip to Region 2 S3 Bucket. Please confirm inputs are valid and suitable AWS CLI credentials are configured to perform uploads to S3 buckets."; exit 1; fi
    aws s3 cp js-sdk-2.958.zip s3://$region2s3bucket/ --region us-west-2
    if [ $? != 0 ]; then echo "Error uploading js-sdk-2.958.zip to Region 2 S3 Bucket. Please confirm inputs are valid and suitable AWS CLI credentials are configured to perform uploads to S3 buckets."; exit 1; fi
else
    echo "Please provide us-east-1 and us-west-2 S3 Bucket Names"
fi