var client=require('./db');

var SaveLogs={
	HelloWord:function(callback)
	{
		client.set("hello", "welcome to redis on NodeJs!", function (err, reply) {
 				 //console.log(err);
 				 callback(err,reply);

		});
	},
	savejson:function(key,json,callback) {
		client.set(key, json, function (err, reply) {
 				 //console.log(err);
 				 callback(err,reply);

		});

	},
	readbykey:function(key,callback) {
		client.get(key, function (err, reply) {
 				 //console.log(err);
 				 callback(err,reply);

		});
	}
	
};

module.exports = SaveLogs;
