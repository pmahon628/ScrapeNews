var express  = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');

var  axios = require('axios');
var cheerio = require('cheerio');

var db = require('./models');

var PORT = 3000;

var app = express();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static('public'));

mongoose.connect('monogodb://localhost/unit18Populator', {newUrlParser: true});

// ROUTES

// Route for scraping NYT
app.get("/scrape", function(req, res){

    axios.get('http://www.newyorktimes.com/').then(function(response){
        var $ = cheerio.load(response.data);

        $("h2").each(function(i, element){
            var result  =  {};

            result.title =$(this)
             .children('a')
             .text();
            result.link  = $(this)
              .children('a')
              .attr("href");
              
           db.Article.create(result)
            .then(function(dbArticle){
                console.log(dbArticle);
            })
            .catch(function(err){
                console.log(err);
            });
        }); 
        res.send('Scrap Complete');
        });
    });

    // ROUTE for getting articles from  DB

    app.get('/articles', function(req, res){
        db.Article.find({})
          .then(function(dbArticle){
              res.json(dbArticle);
         })
          .catch(function(err){
              res.json(err);
          });
        });

        app.listen(PORT, function(){
            console.log("App running on  port " + PORT + "!")
        });