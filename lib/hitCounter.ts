import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import * as path from "path";
import * as cdk from "aws-cdk-lib";

export interface HitCounterProps {
  downstream: lambda.IFunction;
}

export class HitCounter extends Construct {
  public readonly handler: lambda.Function;
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    this.table = new dynamodb.Table(this, "Hits", {
      partitionKey: {
        name: "path",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.handler = new NodejsFunction(this, "HitCounterHandler", {
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "handler",
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: this.table.tableName,
      },
      entry: path.join(__dirname, "/../lambda/hitCounter.ts"),
      bundling: {
        minify: true,
        externalModules: ["aws-sdk"],
      },
    });

    this.table.grantReadWriteData(this.handler);

    props.downstream.grantInvoke(this.handler);
  }
}
