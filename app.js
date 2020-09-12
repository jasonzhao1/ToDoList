//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-jason:Jason0226@clustertest.bvwbu.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemSchema = new mongoose.Schema ({
  name:String
});

const Item = mongoose.model("Item", itemSchema);

const game = new Item ({
  name: "Welcome to the to-do-list"
});

const study = new Item ({
  name: "Click the + sign to add a new item"
});

const sleep = new Item ({
  name: "Check an item to delete it!"
});

const defaultItems = [game, study, sleep];

const listSchema = new mongoose.Schema ({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

const day = date.getDate();

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/add", function(req,res) {
  res.render("add");
})

app.post("/add", function(req,res) {
  const itemName = req.body.newItemName;
  res.redirect("/" + itemName);
})

app.get("/manage", function(req,res) {
  List.find({name: {$nin: ["About","Home","Manage", "Apple-touch-icon.png", "Apple-touch-icon-precomposed.png","Favicon.ico"]}}, function(err,lists){
    if(err) {
      console.log(err);
    } else{
      res.render("manage",{fullList:lists});
  }

  });


})

app.post("/manage", function(req,res) {
  const listName = req.body.indivList;
  List.findOneAndDelete({name: listName}, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/manage");
    }
  })
})

app.get("/", function(req, res) {


  Item.find({}, function(err, items) {
    if (err) {
      console.log(err);
    } else if (items.length === 0){

      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successful insert");
        }
      })
    }
    res.render("list", {listTitle: day, newListItems: items});

  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item ({
    name: itemName
  });

  if (listName === day) {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    })
  }



  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req,res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === day) {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err)
      } else {
        console.log("successfully deleted an item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }



});

app.get("/:customListName", function(req,res){
  const listName = _.capitalize(req.params.customListName);

  List.findOne({name: listName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {

        const list = new List ({
          name : listName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + listName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
