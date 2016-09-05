var mongoose = require('mongoose');
var schema = mongoose.Schema;

var ship = new schema({
	weight: Number,
	dimenstions: String,
	fee: {
		type: Number,
		default: 0
	},
	order: {
		type: schema.Types.ObjectId,
		required: true
	},
	created: {
		type: Date,
		default: Date.now
	}
}, {collection: 'Shipping'});

module.exports = mongoose.model('shipping', ship);