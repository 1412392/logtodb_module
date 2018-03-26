
var db = require("../models/logs");
var fs = require('fs');
var utf8 = require('utf8');
var encoding = require("encoding");
var helperconvension = require("../helpers/convension");
var bcrypt = require('bcryptjs');

function readFiles(dirname, onFileContent) {
    fs.readdir(dirname, function (err, filenames) {
        if (err) {
            
            console.log(err);
            return;
        }
        filenames.forEach(function (filename) {
            fs.readFile(dirname + filename, { encoding: 'utf8' }, function (err, content) {

                onFileContent(filename, content);
            });
        });
    });
};


function GenarateKey() {
	
	var d = new Date();
    var n = d.getTime();

//create random key (salt+time) => never duplicate
 	var salt = bcrypt.genSaltSync();
 	var hash = bcrypt.hashSync(n.toString(), salt);

	return "REDIS_LOGS_KEY_"+n;
}

var logController = {
    index: function (req, res) {

        // db.HelloWord(function(err,result) {

        // 	//console.log(result);


        // 	  	res.render('log/index', {
        //        	title: "Analyzing",

        //    	});

        // }); 

        var data = {};
        var dir='/home/tgdd/my_rasa_nlu/logs/';
        readFiles(dir, function (filename, content) {
            data[filename] = content;
            var splitcontent=content.split('\n');
            //console.log(splitcontent);
            //console.log(splitcontent.length);

            //đọc tiếp theo file dựa vào REDIS_CONTINUE_LINE



            if (splitcontent.length>1) {
            	var lstRedisKet=[];
            	var startIndex=0;

            	for(var i=splitcontent.length-1;i>=0;i--)
            	{
            		if(splitcontent[i]==="REDIS_CONTINUE_LINE")
            		{
            			startIndex=i;
            			break;
            		}
            	}

                //console.log(content);
                for (var i = startIndex; i < splitcontent.length; i++) 
                    {
                        var line = splitcontent[i];
               		if(line==="REDIS_CONTINUE_LINE") continue;

               		console.log(line);
              
                        var convert = helperconvension.convertAllEscapes(line.substring(1, line.length), 'utf8').trim();
                        if(convert==="\n" || convert.length<5)//rác cuối file
                        {
                        	continue;
                        }
                        console.log("=="+convert+"==");
                        var object = JSON.parse(convert);
                    
                   
                    var user_input = object.user_input;
                   	

                    if (user_input.text != "" && user_input.text != null) {

                         var key=GenarateKey();
                        var jsonString = '{' +
                            '"text":' + '"' + user_input.text.replace('\n','') + '"' + ',' +
                            '"key":'+'"'+key+'"'+','+
                             '"status":' + 1 + ',' +
                            '"intent":' + '"' + user_input.intent.name + '"' + ',' +
                            '"entities":' + '[';

                        for (var j = 0; j < user_input.entities.length; j++) {

                            var entity = user_input.entities[j];
                            if (j === user_input.entities.length - 1) {
                                jsonString += '{' +
                                    '"start":' + entity.start + ',' +
                                    '"end":' + entity.end + ',' +
                                    '"value":' + '"' + entity.value.replace('\n','') + '"' + ',' +
                                    '"entity":' + '"' + entity.entity + '"' +
                                    '}';
                            }
                            else {
                                jsonString += '{' +
                                    '"start":' + entity.start + ',' +
                                    '"end":' + entity.end + ',' +
                                    '"value":' + '"' + entity.value.replace('\n','') + '"' + ',' +
                                    '"entity":' + '"' + entity.entity + '"' +
                                    '}' + ',';
                            }

                        }

                        jsonString += ']}';

                        //console.log("====================================================");
                        //console.log(jsonString);
                      
                       
                        lstRedisKet.push(key);
                       //console.log(key);

                        //lưu database
                        db.savejson(key,jsonString,function(err,result) {
			        	  	
                        	// console.log("Set "+key+" : "+jsonString);
                        	// console.log("===================================");

			        	 }); 

                    }

                }   

                  res.render('log/index', {
                    title: "Analyzing",
                    data: lstRedisKet
                });

            }    
           //marrk file read at this  line

			fs.appendFile(dir+filename, 'REDIS_CONTINUE_LINE\n');

        });

       
    },
    sendtoredis: function (req, res) {

        res.sendStatus(200);
    }
};

module.exports = logController;

