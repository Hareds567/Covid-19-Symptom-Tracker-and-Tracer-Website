/**
 * Stop using var, always use const, and if a variable should needed to be changed then use let. You should never have to use var.
 */

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const csvModel = require("./models/csv");
const socialCircle = require("./models/socialcircle");
const csv = require("csvtojson");
const bodyParser = require("body-parser");
const _ = require("lodash");
require("dotenv").config();

/**
 *  Define requirements for express-sections and passport
 */
const session = require("express-session");
const passport = require("passport");
var userProfile;

const isValid = (domain) => {
  if (!userProfile || _.isEmpty(userProfile)) return false;

  return userProfile._json.hd === "oswego.edu";
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploads = multer({ storage: storage });
//connect to db

const {
  MONGO_STRING: url,
  API_KEY: api_key,
  API_SECRET: api_secret,
} = process.env;

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to db"))
  .catch((err) => console.log(err));

//init app
const app = express();

/**
 * Tell Express to recognize sessions.
 */
const baseCookieOptions = {
  name: "app.session",
  secret: "SECRET",
};

app.use(
  session({
    ...baseCookieOptions,
    resave: false,
    saveUninitialized: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
);

/**
 * Tell Express to use Passport.
 */
app.use(passport.initialize());
app.use(passport.session());

//set the template engine
app.set("view engine", "ejs");

app.set("json spaces", 2);

//fetch data from the request
app.use(bodyParser.urlencoded({ extended: true })); // fixed a bug
app.use(bodyParser.json());

//static folder
app.use(express.static(path.resolve(__dirname, "public")));

// webpage stuff
app.get("/", (req, res) => {
  if (isValid()) return res.status(200).redirect("/dashboard");
  else res.status(200).render("auth");
});
app.get("/newLogin", (req, res) => {
  res.status(200).render('demo')
});
app.get("/dashboard", (req, res) => {
  if (!isValid()) {
    req.session.destroy(() => {
      return res.status(403).redirect("/");
    });
  } else
    csvModel.find((err, data) => {
      if (err) {
        console.log(err);
      } else {
        if (data != "") {
          res.render("demo", { data, user: userProfile });
        } else {
          res.render("demo", { data: "" });
        }
      }
    });
});

/**
 * Passport serialization and deserialization
 */
passport.serializeUser((user, callback) => {
  callback(null, user);
});

passport.deserializeUser((object, callback) => {
  callback(null, object);
});

/**
 * Google Authentication.
 */

const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const GOOGLE_CLIENT_ID = api_key;
const GOOGLE_CLIENT_SECRET = api_secret;

passport.use(
  new GoogleStrategy(
    {  //=========================================================================================================================================================
      clientID: "195207891499-sfgfbosugpmbu69o9n4ipae8tjbhvc6v.apps.googleusercontent.com", //GOOGLE_CLIENT_ID,
      clientSecret: "s3n2tsIy3twFVMQ9u7NRRw6c",//GOOGLE_CLIENT_SECRET,
      //callbackURL: "http://localhost:3000/auth/google/callback",
      //callbackURL: "https://covidtrackerdev.herokuapp.com/",
      callbackURL: "http://covidtrackerdev.herokuapp.com/auth/google/callback",
      hostedDomain: "oswego.edu",
      loginHint: "You must use an oswego.eu email to access this resource!",
    },
    (accessToken, refreshToken, profile, done) => {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);

/**
 * Request callbacks
 */

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    prompt: "select_account",
  }),
  (req, res) => {
    // This only runs if the authentication was successful.
    res.redirect("/dashboard");
  }
);


// *****************************************************
// START OF JEFFS CODE
// *****************************************************

// ==============================================
// POST: CSV upload
// ==============================================
app.post('/',uploads.single('csv'),(req,res)=> {
  csv().fromFile(req.file.path).then((jsonObj)=> {
      jsonObj.
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

// TESTING: post request, used for printing post data
app.post('/post_test',(req,res)=> {
  console.log('/post_test: printing req.body below')
  console.log(req.body)
  console.log('end /post_test')
  res.status(200).json({
      message: "/post_test"
  });
});

// TESTING: get request, used for pinging
app.get('/get_test',(req,res)=> {
  console.log('/get_test: printing req.body below')
  console.log(req.body)
  console.log('end /get_test')
  res.status(200).json({
      message: "/get_test"
  });
});

// ==============================================
// OLD version, it never worked
// GET: Social circle
// ==============================================
// const router = express.Router();
// app.use("/", router);
// router.route("/get_social_circle").get(function(req, res) {
//     var query_getSocial = socialCircle.findOne({CircleUser: req.body.CircleUser})
//     query_getSocial.exec(function(err,result){
//         if(err){
//             console.log("Error")
//             res.send(err);
//         }
//         else if(result == null) {
//             console.log('debugging req.body is below')
//             console.log(req.body)
//             console.log("Result was null, no social circle was found");
//             res.send("Result was null, no social circle was found")
//         }
//         else{
//             console.log("get_social_circle: sending social circle");
//             console.log(JSON.stringify(result))
//             res.send(result);
//         }   
//     }); // end query
// });

// ==============================================
// GET: Social circle
// ==============================================
app.post('/get_social_circle',(req,res)=> {
  var query_getSocial = socialCircle.findOne({CircleUser: req.body.CircleUser})
  query_getSocial.exec(function(err,result){
      if(err){
          console.log("Error")
          res.send(err);
      }
      else if(result == null) {
          console.log("/get_social_circle: error null");
          res.send("Result was null, no social circle was found")
      }
      else{
          console.log("/get_social_circle: sucessful");
          console.log(JSON.stringify(result))
          res.send(result);
      }   
  }); // end query
})

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

// *****************************************************
// END OF JEFFS CODE
// *****************************************************

//assign port
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("server run at port " + port));
