var mongoose  =  require('mongoose');

var workplaceSchema = new mongoose.Schema({
    WorkUser:{
        type:String
    },
    Workplace:{
        type:String
    },
});

module.exports = mongoose.model('workplace',workplaceSchema);