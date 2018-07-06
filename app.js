var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var index = require('./routes/index');
var extractor = require('html-extractor');
var request = require('request');
var schedule = require('node-schedule');
var db = require('./db');
var graph = require('fbgraph');
var app = express();
var graphApiParameters = {
    fields: "full_picture , description , story , created_time , name , message"
};
graph.setAccessToken(process.env.ACCESS_TOKEN);
var scheduler = schedule.scheduleJob("*/59 * * * * *", function () {
    console.log("schdule worked");
    graph.get("vladmenumashup/posts", function (err, res) {
        if (err) {
            console.log(err);
        }
        else {
            processAllMashupPosts(res.data);
        }
    });
});
// view engine setup
app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    next(err);
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
//[DATABASE MAIN METHODS]
function updateDatabaseMenuviaFB(title, description, image, date) {
    var api_date = date.split("+");
    db.query("INSERT INTO menu VALUES ('" + title + "','" + description + "', '" + image + "',str_to_date('" + api_date[0] + "','%Y-%m-%dT%H:%i:%s'))", function (err, res) {
        if (err) {
            console.log(title, " new menu not inserted duplicate ");
        }
        else {
            console.log(title, " menu updated");
        }
    });
}
function updateDatabaseMenuviaRequest(title, description, image, date) {
    db.query("INSERT INTO menu VALUES ('" + title + "','" + description + "', '" + image + "',str_to_date('" + date + "','%Y-%m-%d'))", function (err, res) {
        if (err) {
            console.log(title, " new menu not inserted duplicate ");
        }
        else {
            console.log(title, " menu updated");
        }
    });
}
function parseRequestHtmlLaCupola(html) {
    var reduceToList = {
        tag: "div",
        attr: "id",
        val: "content",
        list: true
    };
    var myExtractor = new extractor();
    myExtractor.extract(html, function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            var bodydata = JSON.stringify(data.body);
            var descriptiondata = bodydata.split("Menu Of The Day");
            var description = descriptiondata.pop();
            description = description.replace(/\\n/g, "<br>");
            updateDatabaseMenuviaRequest(data.meta.title, description, data.meta.image, data.meta.date);
        }
    });
}
function processAllMashupPosts(data) {
    data.forEach(function (element) {
        graph.get(element.id, graphApiParameters, function (err, res) {
            if (err) {
                console.log(err);
            }
            else {
                if (res.name !== null) {
                    if (res.name === 'Bistro MOO') {
                        updateDatabaseMenuviaFB(res.name, res.description, res.full_picture, res.created_time);
                    }
                }
                if (res.name !== null) {
                    if (res.name === 'Chef Galerie') {
                        updateDatabaseMenuviaFB(res.name, res.description, res.full_picture, res.created_time);
                    }
                }
            }
        });
    });
}
module.exports = app;
//# sourceMappingURL=app.js.map