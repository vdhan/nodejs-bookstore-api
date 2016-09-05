var mongoose = require('mongoose');
var schema = mongoose.Schema;
var uuid = require('node-uuid');

var book = new schema({
	sku: {
		type: String,
		required: true,
		unique: true,
		default: uuid.v4
	},
	type: {
		type: Number,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		default: ''
	},
	price: {
		type: Number,
		required: true
	},
	quantity: {
		type: Number,
		required: true
	},
	weight: {
		type: Number,
		default: 0
	},
	width: {
		type: Number,
		default: 0
	},
	depth: {
		type: Number,
		default: 0
	},
	height: {
		type: Number,
		default: 0
	},
	created: {
		type: Date,
		default: Date.now
	},
	updated: Date
}, {collection: 'Book'});

book.methods.getDimensions = function() {
	return this.width + 'x' + this.depth + 'x' + this.height;
};

book.pre('save', function(next) {
	this.updated = new Date();
	next();
});

module.exports = mongoose.model('book', book);