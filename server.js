var express  = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var  axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 666;

var app = express();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static('public'));

// mongoose.connect('monogodb://localhost:666/nytimes', {useNewUrlParser: true}) 

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/nytimes";

  // Connect to the Mongo DB
   mongoose.connect(MONGODB_URI);
   mongoose.connect(MONGODB_URI, {useNewUrlParser:true});

// ROUTES

// Route for scraping NYT
app.get("/scrape", function(req, res){

    axios.get('http://www.newyorktimes.com/').then(function(response){
       
        var $ = cheerio.load(html);

        $("article h2").each(function(i, element){
            var result  =  {};

            result.title =$(this)
             .children('p')
             .text();
            result.link  = $(this)
              .children('p')
              .attr("href");
              
           db.Article.create(result)
            .then(function(dbArticle){
                console.log(dbArticle);
            })
            .catch(function(err){
                console.log(err);
            });
        }); 
        res.send('Scrape Complete');
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

    // ROUTE for getting article by id

    app.get("/articles/:id", function(req, res){
        db.Article.findOne({_id: req.params.id})

        .populate('note')
        .then(function(dbArticle){
            res.json(dbArticle);
        })
        .catch(function(err){
            res.json(err);
        });
    });
    // save/update article associated with a note
    app.post('.articles/:id', function(req, res){
        db.Note.create(req.body)
        .then(function(dbNote){
            return db.Article.findOneAndUpdateOne({_id: req.params.id}, { new: true});
        })
        .then(function(dbArticle){
            res.json(dbArticle);
        })
        .catch(function(err){
            res.json(err);
        });
    });

    app.listen(PORT, function(){
        console.log("Running on port: " + PORT + "!");
    });