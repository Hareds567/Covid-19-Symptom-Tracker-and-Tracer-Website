var mongoose  =  require('mongoose');

var csvSchema = new mongoose.Schema({
    id_number:{
        type:String
    },
    first_name:{
        type:String
    },
    last_name:{
        type:String
    },
    middle_name:{
        type:String
    },
    major_code:{
        type:String
    },
    major_name:{
        type:String
    },
    course_id:{
        type:String
    },
    student_email:{
        type:String
    },
    student_year:{
        type:String
    },
    student_address:{
        type:String
    }
});

module.exports = mongoose.model('importTest',csvSchema);