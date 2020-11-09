var mongoose  =  require('mongoose');

var socialCircleSchema = new mongoose.Schema({
    StudentGmail:{
        type:String
    },
    First:{
        type:String
    },
    Second:{
        type:String
    },
    Third:{
        type:String
    },
    Fourth:{
        type:String
    },
    Fifth:{
        type:String
    },
    Sixth:{
        type:String
    },
    Seventh :{
        type:String
    },
    Eighth :{
        type:String
    },
    Ninth :{
        type:String
    }
});

module.exports = mongoose.model('SocialCircle',socialCircleSchema);