import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

interface IEventWithPath {
  path: string;
}

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("request:", JSON.stringify(event, undefined, 2));

  const eventWithPath = event as unknown as IEventWithPath;

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello, CDK! You've hit ${eventWithPath.path}. Enjoy!`,
  };
}
