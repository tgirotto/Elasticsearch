var INDEX = 'music';
var TYPE = 'track';
var HOST = 'localhost:9200';
var LOG = 'trace';

var fs = require('fs');
var elastic = require('elasticsearch');
var filename = process.argv[2];

var client = null;

initialize(function() {
	fs.readFile(filename, 'utf8', function(err, data) {
	  	if (err) 
	    throw err;

	  	var lines = extractLines(data);
	  	var objects = extractObjects(lines);

		processObjects(objects, function(size) {
		    console.log('Processed.');
		   	process.exit();
		});
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

function extractLines(data) {
  console.log('Extracting lines...');
  return data.split('\n');
};

function extractObjects(lines) {
  console.log('Extracting objects...');
  var objects = [];

  for(var i = 0; i < lines.length; i++) {
    var temp = lines[i].split("\"///\"");

    if(temp[12] == undefined) {
    	console.log('error at line: ', i);
    	continue;
    }

    objects.push({
      id: temp[0].substr(1, temp[0].length),
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
      checked: temp[12].substr(0, temp[12].length - 1)
    });

    //console.log(objects[objects.length - 1]);
  }
   
  return objects;
};

function processObjects(objects, callback) {
	for(var i = 0; i < objects.length; i++) {
		iteration(i, objects.length, objects[i], callback);
	}
};

function iteration(number, size, input, callback) {
	client.index({
			index: INDEX,
			type: TYPE,
			id: number,
			body: input
		}, function (error, response) {
			if(number % 1000 == 0)
				process.stdout.write('.');

	  		if(number == size - 1) {
	  			client.indices.refresh({
	  				index: INDEX
	  			}, function() {
	  				console.log('\nRefreshed new index...');
	  				callback();
	  			});
	  		}
	});
};
