const mongo = require("mongodb").MongoClient,
      express     = require("express"),
      fs          = require("fs");
      axios       = require("axios"),
      bodyParser  = require("body-parser");

//var: function scoped
//let: blocked scoped
let app = express();
app.use( bodyParser.json() );       
app.use( bodyParser.urlencoded({ extended: true }));

let collection = null;

function parseToJSONObj(smth){
    var jsonStr = JSON.stringify(smth);
    return JSON.parse(jsonStr);
}

/* Functions that get into the MONGODB */
function connectCollection(callback){
    mongo.connect("mongodb://localhost:27017",
                {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
                    if(err){
                        console.log(err);
                        return;
                    }
                    collection = client.db('world').collection('countries');
                    callback(collection);
                });
}

function getall(callback){

    collection.find({}).toArray((err, data) =>{
        if(err){
            console.log(err);
            return;
        }
        callback(data);
        console.log("All the records have been reached successfully");
    });
    
}

function getOne(callback, name){

    collection.find({country: name}).toArray((err, data) =>{
        if(err){
            console.log(err);
            return;
        }
        callback(data);
        console.log("object reached successfully");
    });
    
}

function inOne(callback, obj){
    collection.insertOne(obj, (err, res) =>{
        if(err){
            console.log(err);
            return;
        }
        callback(res);
        console.log("object has been inserted successfully");
    })
}

function updOne(callback, name, obj){
    collection.updateOne( {country : name }, {$set : obj}, (err, res) =>{
        if(err){
            console.log(err);
            return;
        }
        callback(res);
        console.log("object has been edited successfully");
    })
}

function delOne(callback, name){
    collection.deleteOne({ country : name }, (err, data) => {
        if(err){
            console.log(err);
            return;
        }
        callback(data);
        console.log("object has been deleted successfully");
    })
}

/* End of MONGODB related functions*/


/* Data importing procedure */
const dataUrl = 'https://gist.githubusercontent.com/josejbocanegra/4c553e3b5f1aae1f05ea67068f058087/raw/9f1ec3f2b48cf59ed3c3c4b01d15d1a23b25f57c/countriesall.json';
axios.get(dataUrl).then((response) => {

    var jsonArr = parseToJSONObj(response.data);
    connectCollection((collection) =>{
        collection.insertMany(jsonArr,(err, result) => {
            if(err){
                console.log(err);
                return;
            } 
            console.log(result);
        });
    });
    
}).catch((error) =>{
    console.log(error)
}).finally(() => {
    console.log("finished, great.");
});

/* End of data importing */


/* API url's definition*/
app.get("/countries", (req, res) => {
    getall((data) => {
        res.json(data); 
    });
});

app.get("/countries/:name", (req, res) => {
    var name = req.params.name;
    getOne((data) => {
        res.json(data); 
    }, name);
});

app.post("/countries/", (req, res) => {
    var obj = parseToJSONObj(req.body);
    inOne((response) => {
        res.json(response);
    }, obj);

});

app.put("/countries/:name", (req, res) => {
    var name = req.params.name;
    var obj = parseToJSONObj(req.body);
    updOne((response) => {
        res.json(response);
    }, name, obj);

});

app.delete("/countries/:name", (req, res) => {
    var name = req.params.name;
    delOne((data) => {
        res.json(data);
    }, name)
});
/*End of API's url definition */

app.listen(8080);