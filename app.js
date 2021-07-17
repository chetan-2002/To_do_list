//jshint esversion:6

//MODULES/PACKAGES REQUIRED
const express = require("express"); //requiring the express module
const bodyParser = require("body-parser"); //requiring the body parser external node module for parsing the data that user inputs in the form
const mongoose = require("mongoose"); //requiring the mongoose external node module for saving the data in the database
const date = require(__dirname + "/date.js");  //user defined date module for getting the current date
const _=require("lodash");
const app = express(); //making a express app

app.use(bodyParser.urlencoded({
  extended: true
})); //using the body parser and parsing the data in the form of urlencoded,best suited for parsing the data that came through the forms
app.set('view engine', 'ejs'); //setting the default view engine of the express app to ejs.
app.use(express.static("public")); //defining app to use static material that is css ,that is placed inside folder called public

mongoose.connect("mongodb+srv://admin-chetan:chetan@333@cluster0.aopmq.mongodb.net/toDoListDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}); //connecting our mongoose to the local mongoDB server, which is located at port 27017 and in the server creating a database called "toDoListDB"

const itemSchema = {
  name: String
};//defining a schema for the items that need to be inserted in the database

const Item = mongoose.model("Item", itemSchema);//creating a model for our database,and defing a collection called "Item"

const item1 = new Item({
  name: "Welcome to your to do list"
});
const item2 = new Item({
  name: "hit the + button to add an item"
});
const item3 = new Item({
  name: "hit the checkbox to delete an item"
});//creating 3 documents that would be inserted in out collection

const defaultItems = [item1, item2, item3]; //defining a array of all the documents that needs to be inserted

const listSchema={
  name:String,
  items:[itemSchema]
};
const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved item to  DB");
        }
      });
      res.redirect("/");
    }
    if (err) {
      console.log(err);
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItem: foundItems
      });
    }
  });
});

app.post("/", function(req, res) {
  let itemName = req.body.newItem;
  const listName=req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});
app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(err){
        console.log(err);
      }else{
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/:customListName", function(req, res) {
  const CustomListName = _.capitalize(req.params.customListName);
  List.findOne({name:CustomListName},function(err,foundList){
    if(err){
      console.log(err);
    }else{
      if(!foundList){
        //create a new list
        const list=new List({
          name:CustomListName,
          items:defaultItems,
        });
        list.save();
        res.redirect("/"+CustomListName);
      }else{
        //show existing list
        res.render("list",{listTitle: foundList.name,
        newListItem: foundList.items});
      }
    }
  });

});
app.post("/work", function(req, res) {
  let item = req.body.newListItem;
  workItems.push(item);
  res.redirect("/work");
});
let port=process.env.PORT;
if(port==null || port==""){
  port=3000;
}
app.listen(port, function() {
  console.log("Server listening on port 3000 ");
}); //making the server liisten on port 3000 and a callback function to check id the server has successfully started on port 3000
