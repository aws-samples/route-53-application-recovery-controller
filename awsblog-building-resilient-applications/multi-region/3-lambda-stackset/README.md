# Route 53 Application Recovery Controller Blog Post - Lambda Stack Code

This CloudFormation (CFN) Template supports the requirements of an AWS Blog Post on Route 53 Application Recovery Controller. It is the third and the final CFN. Deploy the *[1-infra-stackset](https://github.com/aws-samples/route-53-application-recovery-controller/single-region/1-infra-stackset/)* and the *[2-arc-stack](hhttps://github.com/aws-samples/route-53-application-recovery-controller/single-region/2-arc-stack)* before deploying this StackSet.

This CFN will deploy a Lambda function that serves a basic web page via an Internet facing ALB. This CFN will also deploy all required supporting components such as Lambda Layers, Application Load Balancers, Security Groups, Roles, Policies, LambdaPermissions, and CloudWatch Scheduled Rules.

### Build Activities
```
$ chmod 700 build.sh
$ ./build.sh
```

### Deployment Activities
* Perform the `Build Activities` outlined above. This simply zips the two Lambda scripts included in this folder into zip files for use during Lambda deployment.
* Upload the two Lambda deployment zip files created above, and the js-sdk-2.958.zip in this repository, to S3 buckets in both deployment regions (us-east-1 and us-west-2). These buckets must either be public, or accessible via the IAM credentials used for the StackSet deployment.
* Update the `LambdaCodeS3Bucket` mapping in both regions of the RegionalParameters Mappings section of the template, based on the S3 buckets used in the step above.
* Deploy the `stack-lambdas.yml` as a StackSet with sequential regional deployment with the primary/first deployment region set to us-east-1 and the secondary/second deployment region set to us-west-2. Provide all required input parameters based on the resources deployed by the Application and Route 53 Application Recovery Controller stacks.

### Deletion Activities
* Stacks must be deleted from the StackSet in the reverse order they were provisioned, i.e. us-west-2 first and us-east-1 second.
* Remove all artefacts from S3 buckets if no longer required.

**Notes:**

> Sensible defaults for almost all configuration options are provided in the "Mappings" section of the `stack-lambdas.yml` template to accelerate deployment of the collective infrastructure. These may be edited prior to deployment but doing so may result in unexpected behaviour. \

> These templates assume familiarity and experience with AWS products and features such as CloudFormation StackSets, and prior account preparation according to the [guidelines available on this documentation is required](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacksets-prereqs-self-managed.html). If you have not used CloudFormation StackSets in your account prior to deploying these templates, please refer to this documentation before commencing. \


**Please note that this sample is provided for demonstration and learning purposes only, and should be reviewed for alignment with organisational policies and best practices before any production use.** \

**Specifically, the Dashboard Lambda deployed in this stack has a Security Group configured which allows traffic to reach it from 0.0.0.0/0, i.e. the Internet. It is recommended to update the LambdaAccessCidrIp StaticParameter in the Mappings section of the `stack-lambdas.yml` to a more granular configuration if possible**
