var mongoose  =  require('mongoose');

var socialCircleSchema = new mongoose.Schema({
    CircleUser:{
        type:String
    },
    SocialCircle:{
        type:Array
    },
});

module.exports = mongoose.model('SocialCircle',socialCircleSchema);