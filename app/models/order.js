var mongoose = require('mongoose');
var schema = mongoose.Schema;

var order = new schema({
	name: {
		type: String,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	sku: {
		type: String,
		required: true
	},
	quantity: {
		type: Number,
		required: true
	},
	created: {
		type: Date,
		default: Date.now
	}
}, {collection: 'Order'});

module.exports = mongoose.model('order', order);