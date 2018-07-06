"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var router = express.Router();
var extractor = require('html-extractor');
var request = require('request');
var mysql = require('mysql');
var db = require('../db');
var no_data_image = "http://canal.tendertiger.com/images/NoDataFound.png";
var no_data_bistro = {
    title: "No data for BistroMoo",
    description: "No data for BistroMoo",
    imagelink: no_data_image,
    timestamp: "No data for BistroMoo"
};
var no_data_chef = {
    title: "No data for Chef",
    description: "No data for Chef",
    imagelink: no_data_image,
    timestamp: "No data for Chef"
};
var no_data_lacupola = {
    title: "No data for La Cupola",
    description: "No data for La Cupola",
    imagelink: no_data_image,
    timestamp: "No data for La Cupola"
};
function padding(array) {
    var chef = false;
    var bistro = false;
    var lacupola = false;
    if (array !== undefined) {
        array.forEach(function (element) {
            if (element.title === 'Chef Galerie') {
                chef = true;
            }
            if (element.title === 'Bistro MOO') {
                bistro = true;
            }
            if (element.title === 'Special offers') {
                lacupola = true;
            }
        });
    }
    if (!chef) {
        array.push(no_data_chef);
    }
    if (!bistro) {
        array.push(no_data_bistro);
    }
    if (!lacupola) {
        array.push(no_data_lacupola);
    }
    return array;
}
router.get('/', function (req, res, next) {
    var data_dictionary = {};
    var promise = new Promise(function (resolve, reject) {
        db.query('select title,description,imagelink,date_format(timestamp,\'%d-%M-%Y\') as timestamp from menu order by timestamp desc;', function (err, results) {
            if (err) {
                reject(err);
            }
            var vals = [];
            var previous_date = '00000';
            if (results !== undefined) {
                results.forEach(function (element) {
                    if (element.timestamp !== previous_date) {
                        if (previous_date !== '00000') {
                            vals = padding(vals);
                            data_dictionary[previous_date] = vals.sort(function (a, b) {
                                var x = a.title.toLowerCase();
                                var y = b.title.toLowerCase();
                                return x < y ? -1 : x > y ? 1 : 0;
                            });
                        }
                        vals = [];
                        previous_date = element.timestamp;
                    }
                    vals.push(element);
                });
            }
            vals = padding(vals);
            data_dictionary[previous_date] = vals.sort(function (a, b) {
                var x = a.title.toLowerCase();
                var y = b.title.toLowerCase();
                return x < y ? -1 : x > y ? 1 : 0;
            });
            resolve("succes");
        });
    });
    promise.then(function (result) {
        res.render("index", { data: data_dictionary });
    });
    promise.catch(function (err) {
        console.log(err);
        res.render("error", { message: err });
    });
});
module.exports = router;
//# sourceMappingURL=index.js.map