//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const ejs = require("ejs");
const _ = require('lodash');
var fs = require('fs');
var path = require('path');
var multer = require('multer');
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/Infomania",{ useNewUrlParser: true, useUnifiedTopology: true });

const defaultItems=[]
const postSchema = {
  image:String,
  title:String,
  content:String
};
const Post = mongoose.model("Post",postSchema);

const listSchema = {
  category:String,
  items:[postSchema]
};

const List = mongoose.model("List",listSchema);


var Storage = multer.diskStorage({
    destination:"./public/uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now()+path.extname(file.originalname))
    }
});

var upload = multer({ storage: Storage }).single('file');










app.get("/compose",function(req,res){
  res.render("compose");
});
app.post("/compose",upload,function(req,res){
const categoryName = _.capitalize(req.body.postCategory);
const post = new Post({
  image:req.file.filename,
  title: req.body.postTitle,
  content: req.body.postBody
});

List.findOne({category:categoryName},function(err,foundList){
    if (!err){
      foundList.items.push(post);
      foundList.save();
      res.redirect("/compose");
    }
  });
});
app.get("/:category/:postId",function(req,res){
  const cat = req.params.category;
  const reqId = req.params.postId;
  List.findOne({category:cat},function(err,foundList){
      for(i in foundList.items){
        const ids = foundList.items[i]
        if(ids.id == reqId){
          console.log();
          res.render("content",{
              images:ids.image,
              title:ids.title,
              content:ids.content
            });

        }

      }

    });

  // Post.findOne({_id:reqId},function(err,post){
  //   console.log("Found Successfully");
  //   // console.log(post);
  //   // res.render("content",{
  //   //   images:post.image,
  //   //   title:post.title,
  //   //   content:post.content
  //   // });
  // });
});


app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({category:customListName},function(err,foundlist){
    if (!err){
      if(!foundlist){
          const list = new List({
            category:customListName,
            items:defaultItems
          });
          list.save();
          res.redirect("/"+customListName);
    }else{
      res.render("category",{categoryName:foundlist.category,newListItems:foundlist.items})
    }
  }

  });

 });



app.get("/",function(req,res){
  res.render("home");
});
app.get("/about",function(req,res){
  res.render("about");
});






















app.listen(3000, function() {
  console.log("Server started on port 3000");
});
