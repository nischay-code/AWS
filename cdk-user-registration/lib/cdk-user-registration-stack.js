const cdk = require('aws-cdk-lib');
const lambda = require('aws-cdk-lib/aws-lambda');
const apigateway = require('aws-cdk-lib/aws-apigateway');
const dynamodb = require('aws-cdk-lib/aws-dynamodb');

class CdkUserRegistrationStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const userTable = new dynamodb.Table(this, 'UserTableCDK', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      tableName: 'Users',
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
    });

    const registerUserLambda = new lambda.Function(this, 'RegisterUserLambdaCDK', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'registerUser.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        USER_TABLE: userTable.tableName,
      },
    });

    userTable.grantReadWriteData(registerUserLambda);

    const api = new apigateway.RestApi(this, 'UserRegistrationApiCDK', {
      restApiName: 'User Registration Service',
    });

    const registerResource = api.root.addResource('register');
    registerResource.addMethod('POST', new apigateway.LambdaIntegration(registerUserLambda));
  }
}

module.exports = { CdkUserRegistrationStack };
