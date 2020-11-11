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
app.post('/',uploads.single('csv'),(req,res)=> {
    csv().fromFile(req.file.path).then((jsonObj)=> {
        // does the mass insertion
        csvModel.insertMany(jsonObj,(err,data)=> {
            if(err) {
                console.log(err);
            }
            else {
                res.redirect('/');
            }
        });
   });
});

// ==============================================
// UNFINISEHD: trying to make a better CSV uplooad post request
// ==============================================
app.post('/testcsv',(req,res)=> {
    var query_no_doc_yet = csvModel.findOne({'StudentEmail': req.body.StudentEmail})
    query_no_doc_yet.exec(function(err,query_results){
        if(query_results==null){ // if no document exists
            csvModel.create( // make a new document
                {
                    "CourseId": [req.body.CourseId],
                    "StudentEmail" : req.body.StudentEmail,
                    "StudentAddress" : req.body.StudentAddress,
                }
            )
            res.status(200).json({
                message: "New document for csvdumps made"
            })
        } // end if
        else {
            csvModel.updateOne({StudentEmail:req.body.StudentEmail},  
                {
                    $push: {CourseId: req.body.CourseId}
                }, function (err, docs) { 
                if (err){ 
                    console.log(err) 
                } 
                else{ 
                    console.log("Csvdumps updated: ", docs); 
                } 
            })
            res.status(200).json({
                message: "Updated existing csvdumps doc"
            })
        } // end else
    });
})

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
    console.log('debugging req.body is below')
    console.log(req.body)
    console.log('end of req body')
    res.send('Get request sucessful.')
});

app.post('/justintest',(req,res)=> {
    console.log('debugging req.body is below')
    console.log(req.body)
    console.log('end of req body')
    res.send('Test post suceessful')
})

app.post('/pain',(req,res)=> {
    var query_getSocial = socialCircle.findOne({CircleUser: req.body.CircleUser})
    query_getSocial.exec(function(err,result){
        if(err){
            console.log("Error")
            res.send(err);
        }
        else if(result == null) {
            console.log('debugging req.body is below')
            console.log(req.body)
            console.log("Result was null, no social circle was found");
            res.send("Result was null, no social circle was found")
        }
        else{
            console.log("WEIRD VERSION: sending social circle");
            console.log(JSON.stringify(result))
            res.send(result);
        }   
    }); // end query
})

// ==============================================
// GET: Social circle
// ==============================================
const router = express.Router();
app.use("/", router);
router.route("/get_social_circle").get(function(req, res) {
    var query_getSocial = socialCircle.findOne({CircleUser: req.body.CircleUser})
    query_getSocial.exec(function(err,result){
        if(err){
            console.log("Error")
            res.send(err);
        }
        else if(result == null) {
            console.log('debugging req.body is below')
            console.log(req.body)
            console.log("Result was null, no social circle was found");
            res.send("Result was null, no social circle was found")
        }
        else{
            console.log("get_social_circle: sending social circle");
            console.log(JSON.stringify(result))
            res.send(result);
        }   
    }); // end query
});

// ==============================================
// POST: Social circle
// ==============================================
app.post('/post_social_circle',(req,res)=> {
    // DEBUGGIN
    console.log('Justin im debugging, req.body is below')
    console.log(req.body)
    console.log('end debugging')
    console.log(req.body.CircleUser)
    // findOne will return a single document
    var query_no_doc_yet = socialCircle.findOne({'CircleUser': req.body.CircleUser})
    query_no_doc_yet.exec(function(err,query_results){
        if(query_results==null){ // if no document exists
            socialCircle.create( // make a new document
                {
                    "CircleUser": req.body.CircleUser,
                    "SocialCircle" : req.body.SocialCircle
                }
            )
            res.status(200).json({
                message: "New document for social circle made"
            })
        }
        else { // document already exists, we can update existing one
            socialCircle.updateOne({CircleUser:req.body.CircleUser},  
                {
                    SocialCircle: req.body.SocialCircle,
                }, function (err, docs) { 
                if (err){ 
                    console.log(err) 
                } 
                else{ 
                    console.log("Social circle updated: "); 
                    // use the below, with docs, if u wanna debug
                    //console.log("Social circle updated: ", docs); 
                } 
            }); 
            res.status(200).json({
                message: "Updated existing social circle doc"
            })
        }
    }); // end query
});

// ==============================================
// Email function
// ==============================================
app.post('/post_send_alert',(req,res)=> {
    console.log(req.body.Email)
    var query_social_circle = socialCircle.findOne({'CircleUser': req.body.Email})
    query_social_circle.exec(function(err,query_results){
        if (err) {
            console.log(err)
        }
        else if (query_results == null) {
            console.log('Email notify error, no social circle found')
            res.status(200).json({
                message: "Email notify error, no social circle doc found"
            })
        }
        else {
            console.log(query_results.SocialCircle)
            var notify_array = query_results.SocialCircle
            var nodemailer = require('nodemailer');
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                user: 'teamecovidapp@gmail.com',
                pass: 'lepjjj2020'  //lingyu,eric,pierce,justin,jeff,john
                }
            });
            
            var mailOptions = {
                from: 'teamecovidapp@gmail.com',
                to: notify_array,              //change this to notify_array
                subject: '(Testing app) You have been exposed to COVID',
                //text: 'You should probably Quarantine or something.'   
                html: '<h1>This is a test email for a app that is being developed, if you got this by mistake ignore this email.</h1> <h2>Someone You Have Been Close to Has Tested Positive for Covid-19</h2><p>Visit <a href="https://oswego.universitytickets.com/">here</a> to schedule an appointment for a Covid-19 test at SUNY Oswego. Covid-19 resources can be found <a href=" https://www.cdc.gov/coronavirus/2019-ncov/index.html">here</a></p>'
            };
            
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                console.log(error);
                } else {
                console.log('Email sent: ' + info.response);
                }
            });
            res.status(200).json({
                message: "Alert sent sucessfully"
            })
        } // end else
    }) // end query
}) // email post email alert

//assign port
var port = process.env.PORT || 3000;
app.listen(port,()=>console.log('server run at port '+ port));