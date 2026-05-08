import {APIGatewayProxyHandler} from "aws-lambda";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import {dynamo, TABLE_NAME} from "../lib/dynamo"
import { generateId } from "../lib/generate-id";

export const handler: APIGatewayProxyHandler = async (event) => {
    const body = JSON.parse(event.body ?? "{}");
    const originalUrl : string= body.url;

    if(!originalUrl || !originalUrl.startsWith("http")){
        return{statusCode:400, body:JSON.stringify({error: "Invalid URL"})};
    }

    const shortId= generateId();
    const createdAt= new Date().toISOString();
    const expiresAt= Math.floor(Date.now()/1000)+30*24*60*60;

    await dynamo.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {shortId, originalUrl, createdAt, expiresAt, clicks: 0}
    }));

    const shortUrl= `https://${event.requestContext.domainName}/${shortId}`;
    return {statusCode: 201, body: JSON.stringify({shortUrl, shortId})};
};

