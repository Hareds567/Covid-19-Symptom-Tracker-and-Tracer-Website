/**
 * Stop using var, always use const, and if a variable should needed to be changed then use let. You should never have to use var.
 */

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const csvModel = require("./models/csv");
const socialCircle = require("./models/socialcircle");
const workplaceModel = require("./models/workplace");
const csv = require("csvtojson");
const bodyParser = require("body-parser");
const _ = require("lodash");
const { OAuth2Client } = require('google-auth-library');
require("dotenv").config();










/**
 *  Define requirements for express-sections and passport
 */
const session = require("express-session");
const passport = require("passport");
const { trimEnd } = require("lodash");
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
  CLIENT_ID: client_id,

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
app.set('views', __dirname + '/views');

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
//=================================================================================================
//Testing new Google Login
//===================================================================
app.get("/upload", (req, res) => {
  res.render("demo");
});

app.get("/dashboard", (req, res) => {
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

//===================================================================
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
    {  //============================================================
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

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
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
// TESTING: just used for testing
app.post('/post_test', (req, res) => {
  console.log('/post_test: printing req.body below')
  console.log(req.body)
  console.log('end /post_test')
  res.status(200).json({
    message: "/post_test: Success"
  });
});

// TESTING: just used for testing
app.get('/get_test', (req, res) => {
  console.log('/get_test: printing req.body below')
  console.log(req.body)
  console.log('end /get_test')
  res.status(200).json({
    message: "/get_test: Success"
  });
});

// ==============================================
// POST: CSV upload
// ==============================================
app.post('/', uploads.single('csv'), (req, res) => {
  csv().fromFile(req.file.path).then((jsonObj) => {
    // does the mass insertion
    jsonObj.forEach(function (student) {
      var temp = csvModel.findOne({ 'StudentEmail': student.StudentEmail })
      temp.exec(function (err, query_results) {
        if (err) {
          console.log(err)
        }
        else if (query_results == null) {
          var Courses = [student.CourseId]
          csvModel.create(
            {
              'StudentEmail': student.StudentEmail,
              'CourseId': Courses
            }
          )
        }
        else {
          var list = query_results.CourseId
          if (!list.includes(student.CourseId)) {
            list.push(student.CourseId)
          }
          csvModel.updateOne({ 'StudentEmail': student.StudentEmail },
            {
              'CourseId': list,
            }, function (err, docs) {
              if (err) {
                console.log(err)
              }
              else {
                console.log(student.CourseId);
                // use the below, with docs, if u wanna debug
                //console.log("Social circle updated: ", docs);
              }
            })
        }
      })
    })
  });
});

// ==============================================
// GET: Social circle
//    **** It's actually a post request, weird fix for issue ****
// ==============================================
app.post('/get_social_circle', (req, res) => {
  var query_getSocial = socialCircle.findOne({ CircleUser: req.body.CircleUser })
  query_getSocial.exec(function (err, result) {
    if (err) {
      console.log("Error")
      res.send(err);
    }
    else if (result == null) {
      console.log("/get_social_circle: error null");
      res.send("Result was null, no social circle was found")
    }
    else {
      console.log("/get_social_circle: sucessful");
      console.log(JSON.stringify(result))
      res.send(result);
    }
  }); // end query
})

// ==============================================
// POST: Social circle
// ==============================================
app.post('/post_social_circle', (req, res) => {
  // findOne will return a single document
  var query_no_doc_yet = socialCircle.findOne({ 'CircleUser': req.body.CircleUser })
  query_no_doc_yet.exec(function (err, query_results) {
    if (query_results == null) { // if no document exists
      socialCircle.create( // make a new document
        {
          "CircleUser": req.body.CircleUser,
          "SocialCircle": req.body.SocialCircle
        }
      )
      res.status(200).json({
        message: "/post_social_circle: new document made"
      })
    }
    else { // document already exists, we can update existing one
      socialCircle.updateOne({ CircleUser: req.body.CircleUser },
        {
          SocialCircle: req.body.SocialCircle,
        }, function (err, docs) {
          if (err) {
            console.log(err)
          }
          else {
            console.log("/post_social_circle: existing doc updated ");
            // use the below, with docs, if u wanna debug
            //console.log("Social circle updated: ", docs); 
          }
        });
      res.status(200).json({
        message: "/post_social_circle: existing doc updated"
      })
    }
  }); // end query
});

// ==============================================
// GET: Workplace
// ==============================================
app.post('/get_workplace', (req, res) => {
  var query_getWorkplace = workplaceModel.findOne({ WorkUser: req.body.WorkUser })
  query_getWorkplace.exec(function (err, result) {
    if (err) {
      console.log("Error")
      res.send(err);
    }
    else if (result == null) {
      console.log("/get_workplace: error null");
      res.send("/get_workplace: error null")
    }
    else {
      console.log("get_workplace: sucessful");
      console.log(JSON.stringify(result))
      res.send(result);
    }
  }); // end query
});

// ==============================================
// POST: Workplace
// ==============================================
app.post('/post_workplace', (req, res) => {
  var query_no_doc_yet = workplaceModel.findOne({ 'WorkUser': req.body.WorkUser })
  query_no_doc_yet.exec(function (err, query_results) {
    if (query_results == null) { // if no document exists
      workplaceModel.create( // make a new document
        {
          "WorkUser": req.body.WorkUser,
          "Workplace": req.body.Workplace
        }
      )
      res.status(200).json({
        message: "/post_workplace: new document made"
      })
    }
    else { // document already exists, we can update existing one
      workplaceModel.updateOne({ WorkUser: req.body.WorkUser },
        {
          Workplace: req.body.Workplace,
        }, function (err, docs) {
          if (err) {
            console.log(err)
          }
          else {
            console.log("/post_workplace: existing document updated");
            // use the below, with docs, if u wanna debug
            console.log("post_workplace updated: ", docs); 
          }
        });
      res.status(200).json({
        message: "/post_workplace: existing document updated"
      })
    }
  }); // end query
});

// ==============================================
// Email: email all people that share workplace
// ==============================================
app.post('/post_alert_workplace', (req, res) => {
  var query_workplace = workplaceModel.findOne({ 'WorkUser': req.body.Email })
  var query_find_pos = workplaceModel.findOne({ 'WorkUser': req.body.Email })
  notify_set = new Set()
  query_workplace.exec(function (err, query_results) {
    query_find_pos.exec(function (err, pos_doc) {
      if (err) {
        console.log(err)
      }
      else if (query_results == null) {
        console.log('/post_alert_workplace: Error, null result')
        res.status(200).json({
          message: '/post_alert_workplace: Error, null result'
        })
      }
      else {
        // query that finds all other users, query result will be an array of documents
        var query_find_others = workplaceModel.find({ 'WorkUser': { $ne: req.body.Email } })
        query_find_others.exec(function (err, the_others_arr) {
          for (z = 0; z < the_others_arr.length; z++) {
            other_doc = the_others_arr[z]
            //console.log(other_doc)
            console.log(pos_doc)
            if (other_doc.Workplace == pos_doc.Workplace) { // if find a matching workplace
              console.log("MATCH FOUND")
              notify_set.add(other_doc.WorkUser) // add to notify set
            }
          } // end loop for ALL other user documents

          console.log('notify_set=', notify_set)
          notify_array = Array.from(notify_set)
          console.log('notify_array=', notify_array)

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
            to: notify_array,
            subject: '(Test Alert) COVID Exposure from: Workplace',
            html: '<h1>This is a test email for a app that is being developed, if you received this by mistake, ignore everything in this email and delete it.</h1> <h2>An anonymous person has tested positive, and you were share a workplace with this person.</h2><p>Visit <a href="https://oswego.universitytickets.com/">here</a> to schedule an appointment for a Covid-19 test at SUNY Oswego. Covid-19 resources can be found <a href=" https://www.cdc.gov/coronavirus/2019-ncov/index.html">here</a></p>'
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

        }) // end query_find_others
        res.status(200).json({
          message: "/post_alert_workplace: SUCCESS",
        })
      } // end else
    }) // end query_find_pos
  }) // end query
})

// ==============================================
// Email: email all social circle members
// ==============================================
app.post('/post_send_alert', (req, res) => {
  console.log(req.body.Email)
  var query_social_circle = socialCircle.findOne({ 'CircleUser': req.body.Email })
  query_social_circle.exec(function (err, query_results) {
    if (err) {
      console.log(err)
    }
    else if (query_results == null) {
      console.log('/post_send_alert: ERROR no social circle found')
      res.status(200).json({
        message: "/post_send_alert: ERROR no social circle doc found"
      })
    }
    else {
      // console.log(query_results.SocialCircle)
      var notify_array = query_results.SocialCircle
      console.log('notify_array=', notify_array)
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
        to: notify_array,
        subject: '(Test Alert) COVID Exposure from: Social Circle',
        html: '<h1>This is a test email for a app that is being developed, if you received this by mistake, ignore everything in this email and delete it.</h1> <h2>An anonymous person has tested positive, and you were listed on this persons social circle.</h2><p>Visit <a href="https://oswego.universitytickets.com/">here</a> to schedule an appointment for a Covid-19 test at SUNY Oswego. Covid-19 resources can be found <a href=" https://www.cdc.gov/coronavirus/2019-ncov/index.html">here</a></p>'
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      res.status(200).json({
        message: "/post_send_alert: SUCCESS"
      })
    } // end else
  }) // end query
}) // email /post_email_alert

// ==============================================
// Email: email all classmates
// ==============================================
app.post('/post_class_alert', (req, res) => {
  var notify_set = new Set() // I use a set to avoid duplicate emails
  // this query finds the positive user
  var query_find_pos = csvModel.findOne({ 'StudentEmail': req.body.Email })
  query_find_pos.exec(function (err, pos_doc) {
    if (err) {
      console.log(err)
      res.status(200).json({
        message: "/post_class_alert: ERROR unknown error"
      })
    }
    else if (pos_doc == null) {
      console.log('/post_class_alert: error null, no doc found')
      res.status(200).json({
        message: "/post_class_alert: error null, no doc found"
      })
    }
    else {
      // query that finds all other users, query result will be an array of documents
      var query_find_others = csvModel.find({ 'StudentEmail': { $ne: req.body.Email } })
      query_find_others.exec(function (err, the_others_arr) {
        for (z = 0; z < the_others_arr.length; z++) {
          other_doc = the_others_arr[z]
          for (o = 0; o < other_doc.CourseId.length; o++) { // iterate through current other user courses
            other_course = other_doc.CourseId[o]
            //console.log('other_course=',other_course)
            for (pi = 0; pi < pos_doc.CourseId.length; pi++) { // iterate through positive user courses
              pos_course = pos_doc.CourseId[pi]
              //console.log('pos_course=',pos_course)
              if (other_course == pos_course) {
                console.log('MATCH FOUND:', pos_doc.StudentEmail, '->', pos_course, other_doc.StudentEmail, '->', other_course)
                notify_set.add(other_doc.StudentEmail)
              }
            } // end loop for positive user document's courses
          } // end loop for other user document's courses
        } // end loop for ALL other user documents

        // console.log('notify_set=',notify_set)
        notify_array = Array.from(notify_set)
        console.log('notify_array=', notify_array)

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
          to: notify_array,
          subject: '(Test Alert) COVID Exposure from: Classmate',
          html: '<h1>This is a test email for a app that is being developed, if you received this by mistake, ignore everything in this email and delete it.</h1> <h2>An anonymous person has tested positive, and you were in a class of this person.</h2><p>Visit <a href="https://oswego.universitytickets.com/">here</a> to schedule an appointment for a Covid-19 test at SUNY Oswego. Covid-19 resources can be found <a href=" https://www.cdc.gov/coronavirus/2019-ncov/index.html">here</a></p>'
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

      }) // end query_find_others
      res.status(200).json({
        message: "/post_class_alert: SUCCESS",
      })
    } // end else
  }) // end query_find_pos
}) // end /post_class_alert

// *****************************************************
// END OF JEFFS CODE
// *****************************************************


//======================================================================================
// Get Courses
//======================================================================================

app.post('/post_courselist', (req, res) => {
  // findOne will return a single document
  var query_no_doc_yet = csvModel.findOne({ 'StudentEmail': req.body.studentEmail })
  query_no_doc_yet.exec(function (err, query_results) {
    if (query_results == null) { // if no document exists
      csvModel.create( // make a new document
        {
          "StudentEmail": req.body.studentEmail,
          "CourseId": req.body.CourseId
        }
      )
      res.status(200).json({
        message: "/post_social_circle: new document made"
      })
    }
    else { // document already exists, we can update existing one
      csvModel.updateOne({ StudentEmail: req.body.studentEmail },
        {
          CourseId: req.body.CourseId,
        }, function (err, docs) {
          console.log("Testin adding classes")
          if (err) {
            console.log("Error "+ err)
          }
          else {
            console.log("/post_courselist: existing doc updated ");
            // use the below, with docs, if u wanna debug
            console.log("Classes updated: "+ JSON.stringify(docs)); 
          }
        });
      res.status(200).json({
        message: "/post_courselist: existing doc updated"
      })
    }
  }); // end query
});


//-----------------------------------------------------------------------------------

app.post('/get_courselist', (req, res) => {
  var query_getSocial = csvModel.findOne({ 'StudentEmail': req.body.studentEmail })
  query_getSocial.exec(function (err, result) {
    if (err) {
      console.log("Error")
      res.send(err);
    }
    else if (result == null) {
      console.log("/get_courselist: error null");
      res.send("Result was null, no classes were found")
    }
    else {
      console.log("/get_courselist: sucessful");
      console.log(JSON.stringify(result))
      res.send(result);
    }
  }); // end query
})
//===================================================================================
//Google Login Stuff
//It doesn't work yet
const client = new OAuth2Client(client_id);

async function verify() {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: client_id,  // Specify the CLIENT_ID of the app that accesses the backend

  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
}

app.post('/tokensignin', (req, res) => {
  console.log("id_token: " + req.body.id_token)
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: req.body.token,
      audience: client_id,
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
  }
  verify().catch(console.error);
  res.send(req.body.id_token)
})
//======================================================================================

//assign port



const port = process.env.PORT || 3000;
app.listen(port, () => console.log("server run at port " + port));
