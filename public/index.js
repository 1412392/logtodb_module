var express=require('express');
var app=express();

require('../config')(app);



//chạy server

app.listen(2018,function(){
	console.log("Successfull port 2018");
});



