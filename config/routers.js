

var Router=require('express').Router;

var controllers=require('../app/controllers');

module.exports=function(app)
{
	

	var homeRouter=Router()
        .get('/', controllers.home.index);
    var logRouter = Router()
        .get('/', controllers.log.index)
        .post('/', controllers.log.sendtoredis);

	

    app.use('/', homeRouter);
    app.use('/readlog', logRouter);
	
}