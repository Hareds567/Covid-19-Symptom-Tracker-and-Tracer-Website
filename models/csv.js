var mongoose  =  require('mongoose');

var csvSchema = new mongoose.Schema({
    Ignore_StudentId:{
        type:String
    },
    Ignore_FirstName:{
        type:String
    },
    Ignore_LastName:{
        type:String
    },
    Ignore_MiddleName:{
        type:String
    },
    Ignore_MajorCode:{
        type:String
    },
    Ignore_MajorName:{
        type:String
    },
    CourseId:{
        type:Array
    },
    StudentEmail:{
        type:String
    },
    Ignore_StudentYear:{
        type:String
    },
    StudentAddress:{
        type:String
    }
});

module.exports = mongoose.model('csvdump',csvSchema);