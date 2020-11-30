We will be using Heroku in this setup guide to host the middleware. We will also be using MongoDB Atlas to host the database. Finally, we will be using Google login for checking user credentials.

***Please complete all the Installation/Creation Guides before proceeding to Setup Guides.***

# Installation/Creation Guides
### NodeJS
**Step 1:**

Download and install nodejs from https://nodejs.org/en/

**Step 2:**

Check if nodejs is installed correctly by entering in your terminal
`$ node -v`
this should give you your version number if nodejs is correctly installed.

### MongoDB Atlas
**Step 1:**
Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas

**Step 2:**
Login to your account. Create a cluster. Follow this guide https://docs.atlas.mongodb.com/tutorial/create-new-cluster/

**Step 3:**
Click "CONNECT" on your cluster. Click "Connect your application". Select "Node.js" as DRIVER. Copy and paste the connection string somewhere safe, you'll be using this later. Replace `<username>` and `<password>` and `<dbname>` in the connection string with your username, password, and dbname.

### ClientID and ClientSecret for Google Login functionality
**Step 1:** Go to: https://console.developers.google.com/

**Step 2:** Sign in to the google account where you want your project and its associated Client ID/Secret hosted.

**Step 3:** On the left-hand side, make sure you are on the "Credentials" tab.

**Step 4:** Click "Create Project".

**Step 5:** Type in a "Project name" and fill out the following blank tabs and click "Create." (Please wait afterwards, it may take up to ten minutes or longer).

**Step 6:** Click on “OAuth consent screen” and select your “User Type” based on your app’s specifications.

**Step 7:** Fill out the following information for OAuth consent screen, Scopes, Optional info, and Summary. 

**Step 8:** Save your information then go to the “OAuth consent screen” and select your project.

**Step 9:** Your Client ID and Client Secret should be in the top right of the screen. Copy the Client ID and Client Secret.

**Step 10:** Paste into the .env file with the “Middleware” code (see Step 4 of Nodejs Setup for more details).

# Setup Guides
### Nodejs Setup
**Step 1:** 

Clone or download the code and place somewhere suitable.

**Step 2:** 

Open your terminal, change directory to main directory of this project's code. The correct directory will contain the file "app.js".

**Step 3:**

In your terminal, type
```
$ npm install
```
to install required packages

**Step 4:**

Open a text editor and copy and paste the following:

```
MONGO_STRING=ReplaceMe
API_KEY = ReplaceMe
API_SECRET = ReplaceMe
```

Where there is "ReplaceMe", enter the associated information. Save the file with filename of "env" in the main directory (the directory with app.js). Now, rename the env file to ".env" and it will dissapear as a hidden file, this is supposed to happen.

### Heroku Setup
**Step 5:**

Follow the tutorial at https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up to deploy the middleware code to Heroku.

**Step 6:**

The app should be deployed at this point. In your Heroku app settings, fill in Config Vars to match the env file. The config vars should be filled out something like:

```
MONGO_STRING=YourMongoString
API_KEY = YourApiKey
API_SECRET = YourApiSecret
```

# FAQ
### How to run on local host?

Fully complete the pre-requisites and setup guide (Steps 1-4) before attempting this. Running on the local host is useful for testing the middleware by sending test post requests. Running on the local host is not necessary for the app to function, you only need to follow the Install/Creation Guides and Setup Guides to get the app running.

**Step 1:**
Go to main project directory, start the app by typing

```
node app.js
```

**Step 2:**
The app will now be running by default at port 3000, URL will be

```
http://localhost:3000
```
You can now send test HTTP requests to http://localhost:3000 using an app like POSTMAN or something similar.


### How should CSVs be formatted?
Our website expects the first line of the CSV files uploaded to be:
```
StudentId,FirstName,LastName,MiddleName,MajorCode,MajorName,CourseId,StudentEmail,StudentYear,StudentAddress
```
If the first line of CSVs is different, you can easily change the schemas in `/models` folder to match whatever the first line of the CSVs actually is.
