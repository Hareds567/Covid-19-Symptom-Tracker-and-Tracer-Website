var mongoose  =  require('mongoose');

var studentsSchema = new mongoose.Schema({
    CircleUser:{
        type:String
    },
    SocialCircle:{
        type:Array
    },
});

module.exports = mongoose.model('Students',socialCircleSchema);