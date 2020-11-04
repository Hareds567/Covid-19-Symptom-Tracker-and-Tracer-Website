var mongoose  =  require('mongoose');

var csvSchema = new mongoose.Schema({
    ID:{
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
    CourseID:{
        type:String
    },
    OswegoEmail:{
        type:String
    },
    Year:{
        type:String
    },
    Address:{
        type:String
    },
});

module.exports = mongoose.model('importTest',csvSchema);