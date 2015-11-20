const AWS_ACCESS_KEY_ID = '###################';
const AWS_SECRET_ACCESS_KEY = '##################################';
const AWS_REGION = 'us-east-1';


var aws = require('aws-sdk');
aws.config.update({
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
});

var db = new aws.DynamoDB.DocumentClient();


var time = 2012;       //     Starting TimeTable to search
var timeEnd = 2014;    //     Ending TimeTable of search
while(time < timeEnd){   

	var params = {
	    TableName: time.toString(),
	    KeyConditionExpression: '#t = :ticker and #d between :date1 and :date2',
	    ExpressionAttributeNames: {
		'#t': 'Ticker',
		'#d': 'Date'
	    },
	    ExpressionAttributeValues: {
		':ticker': 'UKRPI Index',
		':date1': '2012-01-01',     //Starting time
		':date2': '2013-06-30'      // Ending  time
	    }
	};


	db.query(params, function(err, data) {
	    if (err)
		console.log(err, err.stack);
	    else
		console.log(data);
	});

	time++;
}
