var mongoose  =  require('mongoose');

var csvSchema = new mongoose.Schema({
    StudentId:{
        type:String
    },
    FirstName:{
        type:String
    },
    LastName:{
        type:String
    },
    MiddleName:{
        type:String
    },
    MajorCode:{
        type:String
    },
    MajorName:{
        type:String
    },
    CourseId:{
        type:String
    },
    StudentEmail:{
        type:String
    },
    StudentYear:{
        type:String
    },
    StudentAddress:{
        type:String
    }
});

module.exports = mongoose.model('importTest',csvSchema);