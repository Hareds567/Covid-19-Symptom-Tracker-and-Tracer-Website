var mongoose  =  require('mongoose');

var selfreportSchema = new mongoose.Schema({
    ReportUser:{
        type:String
    },
    ReportDate:{
        type:Date
    }
});

module.exports = mongoose.model('selfreport',selfreportSchema);