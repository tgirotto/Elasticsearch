var INDEX = 'music';
var TYPE = 'track';
var HOST = 'localhost:9200';
var LOG = 'trace';

var fs = require('fs');
var elastic = require('elasticsearch');
var readline = require('readline');
var rl = null;

var client = null;

initialize(function() {
  var stream =  fs.createReadStream(process.argv[2]);
  rl = readline.createInterface({input: stream, terminal: false});
  var i = 0;

  rl.on('line', function(line) {
    rl.pause();
    processObject(++i, extractObject(line));
  });

  rl.on('close', function() {
    console.log('\nRefreshed index;');
    process.exit();
  });
});

/****************************************************************************************/

function initialize(callback) {
	client	= new elastic.Client({
  		host: HOST
  		//log: LOG
	});

	client.indices.delete({
		timeout: 30000,
		masterTimeout: 30000,
		index: INDEX
	}, function(error, response, status) {
		console.log('Flushing old index...');
		callback();
	});
};

function convertToQuery(string) {
  if(string != undefined) {
    var punctuationless = removePunctuation(string);
    var temp = punctuationless.split(' ');
    var name = '';

    for(var j = 0; j < temp.length; j++)
      name += temp[j] + '+';

    return name.substr(0, name.length - 1);
  } else
    return '';
};

function removePunctuation(string) {
  var punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~]/g;
  var spaceRE = /\s+/g;
  var result = string.replace(punctRE, '').replace(spaceRE, ' ');
  return result;
};

function extractObject(line) {
  var temp = line.replace(/\"/g, '').split("///");
  var object = {
    id: temp[0],
    sid: temp[1],
    serverid: temp[2],
    title: convertToQuery(temp[3]),
    singerid: convertToQuery(temp[4]),
    styleid: temp[5],
    tagid: temp[6],
    tracktime: temp[7],
    hotnum: temp[8],
    similarid: temp[9],
    status: temp[10],
    pubdate: temp[11],
    checked: temp[12]
  };
   
  return object;
};

function processObject(number, input) {
	client.index({
			index: INDEX,
			type: TYPE,
			id: number,
			body: input
		}, function (error, response) {
      rl.resume();
			if(number % 1000 == 0)
				process.stdout.write('.');
	});
};
