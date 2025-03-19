// Import the AWS SDK
const AWS = require('aws-sdk');

// Configure AWS SDK for DynamoDB
AWS.config.update({
  region: 'ca-central-1', // Replace with your desired region
});

// Create DynamoDB service object
const dynamoDB = new AWS.DynamoDB();

// Example function to list all tables
async function listTables() {
  try {
    const data = await dynamoDB.listTables().promise();
    console.log('Tables:', data.TableNames);
    for (const tableName of data.TableNames) {
      if (tableName === "NameRegister" ) {
        const docClient = new AWS.DynamoDB.DocumentClient();
        const params = {
          TableName: tableName,
        };

        const scanResults = [];
        let items;
        do {
          items = await docClient.scan(params).promise();
          items.Items.forEach((item) => scanResults.push(item));
          params.ExclusiveStartKey = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey !== "undefined");

        for (const item of scanResults) {
          const updateParams = {
          TableName: tableName,
          Key: { pk: item.pk, sk: item.sk },
          UpdateExpression: "set migrated = :value",
          ExpressionAttributeValues: {
            ":value": "true", // Replace with your desired value
          },
          };

          try {
            // console.log("Updating item with pk:", item.pk);
            // console.log("Item:", item);
            await docClient.update(updateParams).promise();
            console.log(`Updated item with pk: ${item.pk} in table: ${tableName}`);
          } catch (updateError) {
            console.error(`Error updating item with pk: ${item.pk} in table: ${tableName}`, updateError);
            console.log(item);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error listing tables:', error);
  }
}

// Call the function
listTables();