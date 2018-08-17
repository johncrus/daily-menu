const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const hbs = require('express-handlebars');
const index = require('./routes/index');
const extractor = require('html-extractor');
const request = require ('request');
const schedule = require('node-schedule');
const db = require('./db');
const graph = require('fbgraph');
const favicon = require('serve-favicon')
const app = express();


const graphApiParameters = {
    fields :  "full_picture , description , story , created_time , name , message"
};

graph.setAccessToken(process.env.ACCESS_TOKEN);

const scheduler = schedule.scheduleJob("*/59 * * * * *", function(){
    console.log("schdule worked");

    graph.get("vladmenumashup/posts",function (err,res) {
        if(err){
            console.log(err);
        }else{
            processAllMashupPosts(res.data);
        }

    });

});
// view engine setup
app.engine('hbs',hbs({extname: 'hbs',defaultLayout: 'layout',layoutsDir: __dirname + '/views/layouts/'}))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(favicon(path.join(__dirname, 'public/images', 'node.png')))
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


//[DATABASE MAIN METHODS]
function updateDatabaseMenuviaFB (title,description,image,date) {
    const api_date= date.split("+");
    db.query(`INSERT INTO menu VALUES ('${title}','${description}', '${image}',str_to_date('${api_date[0]}','%Y-%m-%dT%H:%i:%s'))`, (err, res) => {
        if (err) {
            console.log(title, " new menu not inserted duplicate ");
        }else {
            console.log(title, " menu updated");
        }
    });
}

function updateDatabaseMenuviaRequest (title,description,image,date) {
    db.query(`INSERT INTO menu VALUES ('${title}','${description}', '${image}',str_to_date('${date}','%Y-%m-%d'))`, (err, res) => {
        if (err) {
            console.log(title, " new menu not inserted duplicate ");
        }else {
            console.log(title, " menu updated");
        }
    });
}



function parseRequestHtmlLaCupola(html) {

    const reduceToList = {
        tag: "div",
        attr: "id",
        val: "content",
        list: true
    };
    const myExtractor= new extractor();
    myExtractor.extract(html,function (err,data) {
        if(err){
            console.log(err);
        } else {
            const bodydata=JSON.stringify(data.body);
            const descriptiondata=bodydata.split("Menu Of The Day");
            var description=descriptiondata.pop();
            description=description.replace(/\\n/g,"<br>");
            updateDatabaseMenuviaRequest(data.meta.title,description,data.meta.image,data.meta.date);
        }

    });

}
function processAllMashupPosts (data){

    data.forEach(function (element) {
        graph.get(element.id, graphApiParameters,  function(err, res) {
            if(err){
                console.log(err);
            }else{
                console.log(res.name);
                if(res.name !==null){
                    if (res.name ==='Bistro MOO'){
                        updateDatabaseMenuviaFB(res.name,res.description,res.full_picture,res.created_time);}}
                if(res.name!==null){
                    if (res.name ==='Chef Galerie'){
                        updateDatabaseMenuviaFB(res.name,res.description,res.full_picture,res.created_time);}}
                if(res.name!==null){
                    if (res.name ==='Legend'){
                        updateDatabaseMenuviaFB(res.name,res.description,res.full_picture,res.created_time);}}
            }

        });
    });

}
module.exports = app;
