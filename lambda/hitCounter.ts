import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDB, Lambda } from "aws-sdk";

interface IEventWithPath {
  path: string;
}

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("request:", JSON.stringify(event, undefined, 2));

  const dynamo = new DynamoDB();
  const lambda = new Lambda();

  const eventWithPath = event as unknown as IEventWithPath;

  await dynamo
    .updateItem({
      TableName: process.env.HITS_TABLE_NAME as string,
      Key: {
        path: { S: eventWithPath.path as string },
      },
      UpdateExpression: "ADD hits :incr",
      ExpressionAttributeValues: {
        ":incr": {
          N: "1",
        },
      },
    })
    .promise();

  const resp = await lambda
    .invoke({
      FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME as string,
      Payload: JSON.stringify(event),
    })
    .promise();

  console.log("downstream response:", JSON.stringify(resp, undefined, 2));

  return JSON.parse(resp.Payload as string);
}
