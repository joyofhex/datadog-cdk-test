import iam = require("@aws-cdk/aws-iam");
import { ManagedPolicy } from "@aws-cdk/aws-iam";
import lambda = require("@aws-cdk/aws-lambda");
import { CfnSubscriptionFilter } from "@aws-cdk/aws-logs";
import s3 = require("@aws-cdk/aws-s3");
import s3n = require("@aws-cdk/aws-s3-notifications");
import { Bucket } from "@aws-cdk/aws-s3";
import * as cdk from '@aws-cdk/core';


export class DatadogTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.addTransform("DatadogServerless");

    const applicationName = "yyyd-datadog-test";

    const datadogMapping = new cdk.CfnMapping(this, "Datadog", {
      mapping: {
        Parameters: {
          env: "d",
          nodeLayerVersion: "39",
          pythonLayerVersion: "24",
          service: "datadog-test",
          stackName: this.stackName,
        },
      },
    });

    const datadogBucket = new s3.Bucket(this, `${applicationName}-bucket`, {
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: false,
      },
      bucketName: `${applicationName}-bucket`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      versioned: false,
    });

    const datadogTestRole = new iam.Role(this,`${applicationName}-role`, {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: `${applicationName}-role`,
    });

    datadogTestRole.addManagedPolicy(ManagedPolicy.fromManagedPolicyArn(
      this, "AWSLambdaBasicExecutionRole",
      "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    ));

    const datadogTestLambda = new lambda.Function(this, `${applicationName}-lambda`, {
      code: lambda.Code.fromAsset("functions/s3event/src/s3event"),
      functionName: `${applicationName}-lambda`,
      handler: "s3event.handler",
      memorySize: 1536,
      role: datadogTestRole,
      runtime: lambda.Runtime.PYTHON_3_8,
      timeout: cdk.Duration.seconds(30),
    });

    datadogBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT,
      new s3n.LambdaDestination(datadogTestLambda),
    );

  }
}
