Hej David!

våra endpoints   
  GET - https://0za39tmrm6.execute-api.eu-north-1.amazonaws.com/rooms
  GET - https://0za39tmrm6.execute-api.eu-north-1.amazonaws.com/allBookedRooms
  
  POST - https://0za39tmrm6.execute-api.eu-north-1.amazonaws.com/rooms
  om du byggar ett till room så ska du skicka med, booked, roomnumber, price & type enligt nedan ex: 
  	{
			"booked": [],
			"roomnumber": 301,
			"price": 1500,
			"type": "suite"
		}
  POST - https://0za39tmrm6.execute-api.eu-north-1.amazonaws.com/available
  - Vi tänkte att man först få ut en lista med alla available rooms och för att få de så skickar du in:
  		{
					"visitors": 3,
					"endDate": "2023-12-25",
					"startDate": "2023-12-20"
			
	
				}

  För att sedan bookar
  POST - https://0za39tmrm6.execute-api.eu-north-1.amazonaws.com/book

  	{     "email": "david@david.se",
          "firstname": "David", 
					"visitors": 3,
					"endDate": "2023-12-25",
					"startDate": "2023-12-20",
     	"id": "1699898627953"
			
	
				}
    Om du vill ändrar din bookning
POST - https://0za39tmrm6.execute-api.eu-north-1.amazonaws.com/changeBooking

{     "email": "david@david.se",
          "firstname": "David", 
					"visitors": 2,
					"endDate": "2023-12-25",
					"startDate": "2023-12-20",
     			"bookingsnumber": "1700225033739"
			
	
				}


  POST - https://0za39tmrm6.execute-api.eu-north-1.amazonaws.com/deleteBooking

  och om du vill ta bort din booknig: antingen 
  
{     "email": "david@david.se"
        } eller{
     			"bookingsnumber": "1700225033739"
			
	
				}










<!--
title: 'AWS NodeJS Example'
description: 'This template demonstrates how to deploy a NodeJS function running on AWS Lambda using the traditional Serverless Framework.'
layout: Doc
framework: v3
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->


# Serverless Framework AWS NodeJS Example

This template demonstrates how to deploy a NodeJS function running on AWS Lambda using the traditional Serverless Framework. The deployed function does not include any event definitions as well as any kind of persistence (database). For more advanced configurations check out the [examples repo](https://github.com/serverless/examples/) which includes integrations with SQS, DynamoDB or examples of functions that are triggered in `cron`-like manner. For details about configuration of specific `events`, please refer to our [documentation](https://www.serverless.com/framework/docs/providers/aws/events/).

## Usage

### Deployment

In order to deploy the example, you need to run the following command:

```
$ serverless deploy
```

After running deploy, you should see output similar to:

```bash
Deploying aws-node-project to stage dev (us-east-1)

✔ Service deployed to stack aws-node-project-dev (112s)

functions:
  hello: aws-node-project-dev-hello (1.5 kB)
```

### Invocation

After successful deployment, you can invoke the deployed function by using the following command:

```bash
serverless invoke --function hello
```

Which should result in response similar to the following:

```json
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": {}\n}"
}
```

### Local development

You can invoke your function locally by using the following command:

```bash
serverless invoke local --function hello
```

Which should result in response similar to the following:

```
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": \"\"\n}"
}
```
