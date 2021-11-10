# Route 53 Application Recovery Controller Blog Post - Multi Region Code

This repository supports a blog post on Route 53 Application Recovery Controller. It contains 3 independent but related groups of artifacts:
1. `infra-stackset` is a collection of CloudFormation Nested StackSet templates which deploys base infrastructure components across two regions, used as a basis for modelling and understanding the Route 53 Application Recovery Controller functionality. These components include networking, load balancers, autoscaling groups, and databases.
1. `arc-stack` is a CloudFormation Stack template which deploys all required Route 53 Application Recovery Controller components. It requires a wide range of parameters to be supplied based on the infrastructure deployment handled by #1.
1. `lambda-stackset` is a CloudFormation StackSet template which deploys a pair of Lambda functions across two regions to support operation and understanding of the behaviour intended by #2. The first Lambda function provides a 'dashboard' which shows the current real-world state of the infrastructure deployment based on DNS and API queries. The second Lambda function provides Aurora Global Database failover operations based on scheduled queries against the state of the R53 ARC Routing Controls using the Data Plane APIs. It requires a range of parameters to be supplied based on the deployments handled by #1 and #2.

Deployment requires artefacts to be uploaded to an S3 Bucket in each deployment region (by default, us-east-1 and us-west-2) prior to commencing.

Please refer to the `README.md` files in each subfolder for further information regarding the deployment of each set of artefacts.

Please be mindful that the resources deployed for the purposes of this sample will cost approx. $4.50/hr. Please be sure to clean up all resources by deleting the CloudFormation Stacks when they are no longer required.

**Note:**
* Sensible defaults for almost all configuration options are provided in the "Mappings" section of the `stack-master.yml` template to accelerate deployment of the collective infrastructure. These may be edited prior to deployment but doing so may result in unexpected behaviour.
* These templates assume familiarity and experience with AWS products and features such as CloudFormation StackSets, and prior account preparation according to the [guidelines available on this documentation is required](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacksets-prereqs-self-managed.html). If you have not used CloudFormation StackSets in your account prior to deploying these templates, please refer to this documentation before commencing.

**This sample is provided for demonstration and learning purposes only, and should be reviewed for alignment with organisational policies and best practices before any production use.**
