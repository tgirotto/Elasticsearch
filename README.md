# elastic_search
Indexing and search using Elasticseach

SETUP

1. Clone using "git clone git@github.com:tgirotto/Elasticsearch.git";
2. Download Elasticsearch from https://www.elastic.co/downloads and run "./elasticsearch" from elasticsearch-1.4.4/bin/;
3. Download and install node.js and npm from http://nodejs.org/download/
4. From the root folder, install the request and readline modules using "npm install elasticsearch" and "npm install line-by-line";
5. Run the code with "node app.js [search.txt]" command, where [search.txt] is the input file containing the input.
6. Once the process has completed, open any browser and search through the indexed data. For example, to search through all the tracks: 		http://localhost:9200/music/track/_search.

STRUCTURE

The app is offered in two versions:

1. 'app.js', which is faster (based on simple fileRead) and geared towards small files. This version first loads all data into memory and then dumps it into Elasticsearch;
2. 'app_stream.js', which is slower (based on node streams) and geared towards big files. This version pauses and resumes stream reads alternating them to data dumping into Elasticsearch. 

QUERYING THE DATABASE

The database can be queried using a format which is very similar to HTTP GET/POST. For example, given a database in which we stored objects of the format:

    {
    	"name":"Tell+Me+A+Secret+Feat+NeYo",
    	"artist":"Ludacris+"
    }

the query http://localhost:9200/music/track/_search?q=name:Loves+Been+Good+To+Me will return all the objects containing any of the words in their "name" field:

	{
    	"took":198,
        "timed_out":false,
        "_shards":		
        	{"total":5,
            "successful":5,
            "failed":0},
        "hits":
        	{"total":3,
             "max_score":0.8664763,
             "hits:	
             [{"_index":"music",
               "_type":"track",
               "_id":"4",
               "_score":0.8664763,
               "_source":
                   {"name":"Loves+Been+Good+To+Me",
                    "artist":"Frank+Sinatra+"}},
               {"_index":"music",
               "_type":"track",
               "_id":"5",
               "_score":0.030714406,
               "_source":
                   {"name":"Good+Fight",
                   "artist":"Dashboard+Confessional+"}},
               {"_index":"music",
               "_type":"track",
               "_id":"0",
               "_score":0.023035804,
               "_source":
                    {"name":"Tell+Me+A+Secret+Feat+NeYo",
                    "artist":"Ludacris+"}}
               ]}
	}

CURL can also be used. To get all documents in the database, run the following:

    curl -X POST  http://localhost:9200/music/track/_search -d '{"query": {"match_all":{}}}'


IMPORTANT

It should be taken into account that Elasticsearch uses pagination. To determine the size and offset of the pages returned, the following command can be used:

    http://localhost:9200/music/track/_search?size=500&from=10&q=name:Loves+Been+Good+To+Me

where 'size' is size of each page and 'from' is the offset. Similarly:

  curl -X POST  http://localhost:9200/music/track/_search?size=500&from=10 -d '{"query": {"match_all":{}}}'


SEARCH THROUGH ALL FIELDS

Some useful examples of how to query an Elasticsearch database can be found at: http://okfnlabs.org/blog/2013/07/01/elasticsearch-query-tutorial.html#curl-or-browser

In particular, the tutorial states:

"Classic Search-Box Style Full-Text Query
This will perform a full-text style query across all fields. The query string supports the Lucene query parser syntax and hence filters on specific fields (e.g. fieldname:value), wildcards (e.g. abc*) as well as a variety of options."

    {
        "query": {
            "query_string": {
                "query": {query string}
            }
        }
    }

For example, in order to look for all the documents which contain the token 'good' in any of the fields, the following query can be used, through the browser:

	http://localhost:9200/music/track/_search?source={"query": {"query_string": {"query": "good"}}}
    
or through CURL:

	curl -X POST  http://localhost'9200/music/track/_search -d '{"query": {"query_string": {"query": "good"}}}'
