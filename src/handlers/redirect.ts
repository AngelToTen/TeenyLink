import { APIGatewayProxyHandler } from "aws-lambda";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import{dynamo, TABLE_NAME} from "../lib/dynamo";

export const handler: APIGatewayProxyHandler = async (event) => {
    const shortId= event.pathParameters?.id;
    
    if(!shortId){
        return{statusCode: 400, body:JSON.stringify({error: "Missing Id"})};
    }
    const result = await dynamo.send(new GetCommand({
        TableName: TABLE_NAME,
        Key:{shortId}
    }));

    if(!result.Item){
        return{statusCode: 404, body: JSON.stringify({error: "URL not found"})};
    }

    await dynamo.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {shortId},
        UpdateExpression: "ADD clicks :inc",
        ExpressionAttributeValues: {"inc": 1}
    }));

    return{
        statusCode:302,
        headers:{location: result.Item.originalUrl},
        body: ""
    };
};
