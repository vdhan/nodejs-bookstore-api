var mongoose = require('mongoose');
var schema = mongoose.Schema;

var promote = new schema({
	code: {
		type: String,
		required: true
	},
	type: {
		type: Number,
		required: true
	},
	details: {
		type: String,
		default: ''
	},
	amount: {
		type: String,
		required: true
	}
}, {collection: 'Promote'});

module.exports = mongoose.model('promote', promote);