var express     = require('express');
var mongoose    = require('mongoose');
var multer      = require('multer');
var path        = require('path');
var csvModel    = require('./models/csv');
var socialCircle = require('./models/socialcircle')
var csv         = require('csvtojson');
var bodyParser  = require('body-parser');

var storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./public/uploads');
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    }
});

var uploads = multer({storage:storage});
//connect to db
var url =   'mongodb+srv://Admin:admin@cluster0.zoibg.mongodb.net/COVID-App?retryWrites=true&w=majority'

mongoose.connect(url,{useNewUrlParser:false})
.then(()=>console.log('connected to db'))
.catch((err)=>console.log(err))


//init app
var app = express();

//set the template engine
app.set('view engine','ejs');

//fetch data from the request
app.use(bodyParser.urlencoded({extended:true})); // fixed a bug
app.use(bodyParser.json());

//static folder
app.use(express.static(path.resolve(__dirname,'public')));

// webpage stuff
app.get('/',(req,res)=>{
    
    csvModel.find((err,data)=>{
         if(err){
             console.log(err);
         }else{
              if(data!=''){
                  res.render('demo',{data:data});
              }else{
                  res.render('demo',{data:''});
              }
         }
    });
});
// ==============================================
// POST: CSV upload
// ==============================================
// csv upload from website
app.post('/',uploads.single('csv'),(req,res)=>{
csv()
.fromFile(req.file.path)      
.then((jsonObj)=>{
    console.log(jsonObj);
     csvModel.insertMany(jsonObj,(err,data)=>{
            if(err){
                console.log(err);
            }else{
                res.redirect('/');
            }
     });
   });
});

// TESTING: post request, used for pinging
app.post('/postdata',(req,res)=> {
    var data = req.body.data;
    res.status(200).json({
        message: "Data recieved sucessfully."
    });
});

// TESTING: post request, used for printing post data
app.post('/posttest',(req,res)=> {
    var data = req.body;
    console.log(data);
    res.status(200).send(data);
});

// TESTING: get request, used for pinging
app.get('/gettest',(req,res)=> {
    res.send('Get request sucessful.')
});

// ==============================================
// GET: Social circle
// ==============================================
const router = express.Router();
app.use("/", router);
router.route("/get_social_circle").get(function(req, res) {
    socialCircle.findOne({}, function(err, result) {
      if (err) {
        console.log("get_social_circle: no social circle found");
        res.send(err);
      } else {
        console.log("get_social_circle: sending social circle");
        res.send(result);
      }
    });
  });

// ==============================================
// POST: Social circle
// ==============================================
/* Post JSON body should be of format below
{
    "CircleUser": "jcabrera@oswego.edu",
    "SocialCircle1": "socialcircle1@oswego.edu",
    "SocialCircle2": "socialcircle22@oswego.edu",
    "SocialCircle3": "socialcircle333@oswego.edu",
    "SocialCircle4": "socialcircle4444@oswego.edu",
    "SocialCircle5": "socialcircle55555@oswego.edu",
    "SocialCircle6": "socialcircle666666@oswego.edu",
    "SocialCircle7": "socialcircle7777777@oswego.edu",
    "SocialCircle8": "socialcircle88888888@oswego.edu",
    "SocialCircle9": "socialcircle999999999@oswego.edu"
}
*/
app.post('/post_social_circle',(req,res)=> {
    console.log(req.body.CircleUser)
    // findOne will return a single document
    var query_no_doc_yet = socialCircle.findOne({'CircleUser': req.body.CircleUser})
    query_no_doc_yet.exec(function(err,query_results){
        if(query_results==null){ // if no document exists
            socialCircle.create( // make a new document
                {
                    "CircleUser": req.body.CircleUser,
                    "SocialCircle1" : req.body.SocialCircle1,
                    "SocialCircle2" : req.body.SocialCircle2,
                    "SocialCircle3" : req.body.SocialCircle3,
                    "SocialCircle4" : req.body.SocialCircle4,
                    "SocialCircle5" : req.body.SocialCircle5,
                    "SocialCircle6" : req.body.SocialCircle6,
                    "SocialCircle7" : req.body.SocialCircle7,
                    "SocialCircle8" : req.body.SocialCircle8,
                    "SocialCircle9" : req.body.SocialCircle9,
                }
            )
            res.status(200).json({
                message: "New document for social circle made"
            })
        }
        else { // document already exists, we can update existing one
            socialCircle.updateOne({CircleUser:req.body.CircleUser},  
                {
                    SocialCircle1:req.body.SocialCircle1,
                    SocialCircle2:req.body.SocialCircle2,
                    SocialCircle3:req.body.SocialCircle3,
                    SocialCircle4:req.body.SocialCircle4,
                    SocialCircle5:req.body.SocialCircle5,
                    SocialCircle6:req.body.SocialCircle6,
                    SocialCircle7:req.body.SocialCircle7,
                    SocialCircle8:req.body.SocialCircle8,
                    SocialCircle9:req.body.SocialCircle9,
                }, function (err, docs) { 
                if (err){ 
                    console.log(err) 
                } 
                else{ 
                    console.log("Social circle updated: ", docs); 
                } 
            }); 
            res.status(200).json({
                message: "Updated existing social circle doc"
            })
        }
    });
});

//assign port
var port = process.env.PORT || 3000;
app.listen(port,()=>console.log('server run at port '+ port));