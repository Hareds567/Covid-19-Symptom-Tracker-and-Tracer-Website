var mongoose  =  require('mongoose');

var socialCircleSchema = new mongoose.Schema({
    CircleUser:{
        type:String
    },
    SocialCircle1:{
        type:String
    },
    SocialCircle2:{
        type:String
    },
    SocialCircle3:{
        type:String
    },
    SocialCircle4:{
        type:String
    },
    SocialCircle5:{
        type:String
    },
    SocialCircle6:{
        type:String
    },
    SocialCircle7 :{
        type:String
    },
    SocialCircle8 :{
        type:String
    },
    SocialCircle9 :{
        type:String
    }
});

module.exports = mongoose.model('SocialCircle',socialCircleSchema);