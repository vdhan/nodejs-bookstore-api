var mongoose = require('mongoose');
var schema = mongoose.Schema;

var type = new schema({
	id: {
		type: Number,
		required: true,
		unique: true
	},
	type: {
		type: String,
		required: true
	}
}, {collection: 'PromoteType'});

module.exports = mongoose.model('PromoteType', type);