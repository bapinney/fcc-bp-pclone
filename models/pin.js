var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*  Pin owner schema will be used as a Mongo sub-doc
    inside of the Pin doc */
var pinOwnerSchema = new Schema({
    userProvider    : String,
    userId          : Number,
    userName        : String
});


var likesValidator = function(arr) {
    
};

var pinSchema = new Schema({
    dateCreated     : { type: Date, default: Date.now },
    pinOwner        : [pinOwnerSchema],
    imgUrl          : String,
    title           : String,
    likes           : Array
    },
    {collection: 'fccpclone-pins'} //The collection will be created if it does not exist
);

module.exports = mongoose.model('Pin', pinSchema);