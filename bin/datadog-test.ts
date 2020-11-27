#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DatadogTestStack } from '../lib/datadog-test-stack';

const app = new cdk.App();

const props = {
  appStackName: "daisy",
  applicationName: "datadog-test",
  env: {
    account: "269907359385",
    region: "eu-west-1",
  },
  environment: "d",
  region: "eu-west-1",
};
const stack = new DatadogTestStack(app, 'DatadogTestStack', { ...props, });

cdk.Tags.of(stack).add("Application", "DAISY");
cdk.Tags.of(stack).add("Environment", "D");
