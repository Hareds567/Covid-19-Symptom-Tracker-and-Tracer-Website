var mongoose  =  require('mongoose');

var csvSchema = new mongoose.Schema({
    CRN:{
        type:String
    },
    Email:{
        type:String
    },
    FirstName:{
        type:String
    },
    ID:{
        type:String
    },
    LastName:{
        type:String
    },
    Major:{
        type:String
    },
    Mid:{
        type:String
    },
    Year:{
        type:String
    },
    Zip:{
        type:String
    },
    a:{
        type:String
    },
    b:{
        type:String
    },
    c:{
        type:String
    }
});

module.exports = mongoose.model('DataDump',csvSchema);