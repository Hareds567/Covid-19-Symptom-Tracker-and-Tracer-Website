# Middleware Setup

## Pre-requisites
**Step1:**

Download and install nodejs from https://nodejs.org/en/
**Step2:**

Check if nodejs is installed correctly by entering in your terminal
`$ node -v`
this should give you your version number if nodejs is correctly installed.

## Setup Guide

Make sure you have done the pre-requisites before following this guide. 

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

**Step 5:**

Follow the tutorial at https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up to deploy the middleware code to Heroku.

**Step 6:**

The app should be deployed at this point. In your Heroku app settings, fill in Config Vars to match the env file. The config vars should be filled out something like:

```
MONGO_STRING=YourMongoString
API_KEY = YourApiKey
API_SECRET = YourApiSecret
```

## Running On Local Host

Fully complete the pre-requisites and setup guide (Steps 1-4) before attempting this.

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
