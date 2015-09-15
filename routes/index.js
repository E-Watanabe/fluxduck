var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
var requestIp = require('request-ip');
var util = require('util');

var iOptions = {
	"publisher" : "6730059412037890", //pub id
	"v" : "2", //version 2
	"format" : "json", //return format
	"callback" : "resultsFunc()", //callback to be called upon response
	"qs" : "as_and", //query string
	"start" : 0,
	"end" : 49,
	"jt" : "fulltime", //job type
	"limit" : "50", //number of results to return in json
	"userip" : "", //ip of the end-user
	"useragent" : "" //user-agent
};

var urlBase = "http://api.indeed.com"; //url of xml api - not correct

//Our results from indeed
var iResults;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('fluxduck', { title: 'Proventa' });
});

router.post('/', function(req, res) {

	//finds the ip of the end-user
	var clientIp = requestIp.getClientIp(req);
	iOptions.userip = clientIp;

	//finds the user-agent of the end-user
	var uAgent = req.headers['user-agent'];
	iOptions.useragent = uAgent;

	var query = Object.keys(req.body)[0];
	iRequest(query, function(data) {
		//console.log(data);
		//fs.writeFileSync('./log.json', util.inspect(data), 'utf-8');
		var results = JSON.parse(data);
		var len = Object.keys(results).length;
		//console.log(len);
		//console.log(results);
		//fs.writeFileSync('./data.json', JSON.stringify(results, null, 4), 'utf-8');
		//fs.writeFileSync('./fin.json', JSON.stringify(fin, null, 4), 'utf-8');

		deriveList(results, function(top_ten) {
			res.writeHead(200, {'Content-Type' : 'text/plain'});
			console.log(top_ten);
			res.end(JSON.stringify(top_ten, null, 4));
		});
		//console.log(JSON.stringify(data));
		
	});
});

var data = '';
var count = 0;

var iRequest = function(query, data_cb) {
	var q = queryEdit(query);
	var urlReq = urlBase + "/ads/apisearch?publisher=" + iOptions.publisher + "&q=" + q + "&jt=" + iOptions.jt;
	urlReq = urlReq + "&limit=" + iOptions.limit + "&format=" + iOptions.format + "&userip=1.2.3.4";
	urlReq = urlReq + "&useragent=" + queryEdit(iOptions.useragent) + "&v=" + iOptions.v + "&psf=advsrch";
	//console.log(urlReq);
	//urlReq = "http://api.indeed.com/ads/apisearch?publisher=6730059412037890&q=software+engineer&jt=fulltime&limit=25&userip=1.2.3.4&useragent=Mozilla/%2F4.0%28Firefox%29&v=2&format=json";

	var options = {
		//url: 'http://api.indeed.com/ads/apisearch?publisher=6730059412037890&q=software+engineer&jt=fulltime&limit=25&userip=1.2.3.4&useragent=Mozilla/%2F4.0%28Firefox%29&v=2&format=json',
		url: urlReq,
		port: 80,
		method: 'GET',
		headers: {
			"content-type": "application/json",
			"accept": "application/json",
			"user-agent": iOptions.useragent
		}
	};

	var urlReq = urlBase + "/ads/apisearch?publisher=" + iOptions.publisher + "&q=" + q + "&jt=" + iOptions.jt;
	urlReq = urlReq + "&start=" +10+ "&limit=" + iOptions.limit + "&format=" + iOptions.format + "&userip=1.2.3.4";
	urlReq = urlReq + "&useragent=" + queryEdit(iOptions.useragent) + "&v=" + iOptions.v + "&psf=advsrch";
	//console.log(urlReq);

	request(options)
		.on('response', function(res) {
			data = '';
			res.setEncoding('utf8');
			res.on('data', function(d){
				data+=d;
			});
			res.on('end', function() {
				//console.log(data);
				/*if (count != 5) {
					count++;
					iOptions.start = iOptions.start + 10;
					iRequest(query, data_cb);
				} else */
					data_cb(data);
			});
		})
		.on('error', function(err) {
			console.log(err);
		})

}

var queryEdit = function(query) {
	var q = String(query).replace(/ /g, "+");
	return q;
}

//Dependencies for company list file cleanup
var feelings = require('../scripts/feelings.json');
var cList = require('../scripts/companylist.json');
var jsonfile = require('jsonfile');
var fin = require('../fin.json');

var deriveList = function(data, post_cb) {
	//createFinal(function(fin) {
		iMatch(data, function(top_ten) {
			post_cb(top_ten);
		});
		//post_cb();
	//});
}

var iMatch = function(data, callback) {
	//console.log(JSON.stringify(data));
	//console.log(JSON.stringify(fin));
	var top = [];

	var i = 0;
	var len = Object.keys(data).length;
	//console.log(len);

	while(i < len) {
		var company = data["results"][i]["company"] + "";
		console.log("company: " +company);
		var flag = strMatcher(company);
		console.log("flag: " +flag);
		if (flag != -1) {
			data["results"][i].Value = flag;
			top.push(data["results"][i]);
		}
		i++;
	}

	//console.log(Object.keys(data).length);
	if (i == Object.keys(data).length) {
		callback(top);
	}
}

var strMatcher = function(str) {
	for (var i = 0; i < Object.keys(fin).length; i++) {
		var text = fin[i]["Company"] + "";
		//console.log("text: " +text);
		if (text.search(str) != -1) {
			console.log("success");
			return fin[i]["Value"];
		}
	}

	return .25;
}

/*


Code that
may
or
may
not
be
used ever
again










*/
var createFinal = function(callback) {
	var i;
	for (i = 0; i < Object.keys(feelings).length; i++) {
		var symbol = feelings[i].Company;
		var name = symbol;
		//console.log(feelings[i].Company + " : " + feelings[i][" Value"] + "\n");

		var j = 0;
		while (j < Object.keys(cList).length && !(cList[j].Symbol === symbol)) {
			j++;
		}

		if (j < Object.keys(cList).length) {
			name = cList[j].Name;
			feelings[i].Company = name;
			fin.push({ "Company" : feelings[i].Company, "Value" : feelings[i][" Value"] });
		}

		//console.log(feelings[i].Company + " : " + feelings[i][" Value"] + "\n");
	}

	for (i = 0; i < Object.keys(fin).length; i++) {
		console.log(fin[i].Company + " : " + fin[i].Value + "\n");
	}

	if (i == Object.keys(feelings).length) {
		/*fs.writeFileSync('./fin.json', JSON.stringify(fin, null, 4), 'utf-8', function(err) {
			callback(fin);
		});*/
		callback(fin);
	}
}

module.exports = router;
