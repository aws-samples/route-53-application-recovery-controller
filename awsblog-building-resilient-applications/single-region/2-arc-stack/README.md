# Route 53 Application Recovery Controller Blog Post - Application Recovery Controller Stack Code

This CloudFormation (CFN) Template supports the requirements of an AWS Blog Post on Route 53 Application Recovery Controller. It is the second of a three CFN Deployment. Deploy the *[1-infra-stackset]*(https://github.com/aws-samples/route-53-application-recovery-controller/single-region/1-infra-stackset/) before deploying this stack. 

This *2-arc-stack* should be deployed as a standard Stack in us-east-1, within a single AWS account. It will deploy the following Route 53 Application Recovery Controller components:  
* Recovery Readiness Groups, Cells, and Resource Sets  
* Routing Control Clusters, Control Panels, Routing Controls, Safety Rules, and Healthchecks  
* Route 53 DNS Private Hosted Zone and associated DNS entries  

Please be mindful that the resources deployed for the purposes of this sample will cost approx. $2.50/hr. Please be sure to clean up all resources by deleting the CloudFormation Stacks when they are no longer required.

Please note that after deployment of this template, you will need to enable the routing controls in the AWS console [based on the guidance here](https://docs.aws.amazon.com/r53recovery/latest/dg/routing-control.update.html). Based on the safety rules configured as part of this deployment, you will need to enable the routing controls in the following order:
1. arcblog-Cell1-us-east-1a, arcblog-Cell1-us-east-1b, arcblog-Cell1-us-east-1c (You may choose to only enable 2 of these controls)
2. arcblog-Cell1-us-east1

**Notes:**

* Sensible defaults for almost all configuration options are provided in the "Mappings" section of the `stack-lambdas.yml` template to accelerate deployment of the collective infrastructure. These may be edited prior to deployment but doing so may result in unexpected behaviour. \ 

**This sample is provided for demonstration and learning purposes only, and should be reviewed for alignment with organisational policies and best practices before any production use.**