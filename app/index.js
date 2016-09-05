'use strict';

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = 8081;
var router = express.Router();
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/db1');

var Book = require('./models/book');
var Order = require('./models/order');
var Promote = require('./models/promote');
var Shipping = require('./models/ship');

function regexEscape(s) {
	return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

router.route('/book')
	.post(function(req, res) { // add book
		var data = req.body;
		var book = new Book();
		book.sku = data.sku || uuid.v4();
		book.type = data.type;
		book.title = data.title;
		book.description = data.description || '';
		book.price = data.price;
		book.quantity = data.quantity;
		book.weight = data.weight || 0;
		book.width = data.width || 0;
		book.depth = data.depth || 0;
		book.height = data.height || 0;

		book.save(function(err) {
			if(err) {
				return res.status(400).json(err);
			}

			res.json({
				sku: book.sku,
				type: book.type,
				title: book.title,
				description: book.description,
				price: book.price,
				quantity: book.quantity,
				weight: book.weight,
				dimensions: book.getDimensions(),
				created: book.created
			});
		});
	})

	.get(function(req, res) { // calculate books remain
		Book.aggregate({
			$group: {
				_id: null,
				sum: {$sum: '$quantity'}
			}
		}, function(err, result) {
			if(err) {
				return res.status(400).json(err);
			}

			var b = result.length ? result[0] : {sum: 0};
			res.json({sum: b.sum});
		});
	});

router.route('/book/:sku')
	.get(function(req, res) { // get book
		Book.findOne({sku: req.params.sku}, '-__v -_id', function(err, doc) {
			if(err) {
				return res.status(400).json(err);
			}

			if(!doc) {
				return res.status(404).json({error: 'Book not found'});
			}

			res.json(doc);
		});
	})

	.put(function(req, res) { // update book
		var data = req.body;

		Book.findOne({sku: req.params.sku}, function(err, doc) {
			if(err) {
				return res.status(400).json(err);
			}

			if(!doc) {
				return res.status(404).json({error: 'Book not found'});
			}

			doc.type = data.type || doc.type;
			doc.title = data.title || doc.title;
			doc.description = data.description || doc.description;
			doc.price = data.price || doc.price;
			doc.quantity = data.quantity || doc.quantity;
			doc.weight = data.weight || doc.weight;
			doc.depth = data.depth || doc.depth;
			doc.height = data.height || doc.height;

			doc.save(function(err) {
				if(err) {
					return res.status(400).json(err);
				}

				res.json({
					sku: doc.sku,
					type: doc.type,
					title: doc.title,
					description: doc.description,
					price: doc.price,
					quantity: doc.quantity,
					weight: doc.weight,
					dimensions: doc.getDimensions(),
					created: doc.created
				});
			});
		});
	})

	.delete(function(req, res) { // delete book
		Book.remove({sku: req.params.sku}, function(err) {
			if(err) {
				return res.status(400).json(err);
			}

			res.json({message: 'ok'});
		})
	});

router.route('/promote/:code')
	.get(function(req, res) { // get promote
		Promote.findOne({code: req.params.code}, '-_id -type', function(err, doc) {
			if(err) {
				return res.status(400).json(err);
			}

			if(!doc) {
				return res.status(404).json({error: 'Promote not found'});
			}

			res.json(doc);
		});
	});

router.route('/order')
	.post(function(req, res) { // order book
		var data = req.body;
		var quantity = data.quantity;
		if(!(Number.isInteger(quantity) && quantity > 0)) {
			return res.status(400).json({error: 'Quantity must be a positive integer'});
		}

		Book.findOne({sku: data.sku}, function(err, book) {
			if(err) {
				return res.status(400).json(err);
			}

			if(!book) {
				return res.status(404).json({error: 'Book not found'});
			}

			if(quantity > book.quantity) {
				return res.status(400).json({error: 'Book out of stock'})
			}

			var order = new Order();
			order.name = data.name;
			order.address = data.address;
			order.sku = data.sku;
			order.quantity = data.quantity;

			order.save(function(err) {
				if(err) {
					return res.status(400).json(err);
				}

				var havePromote = false;
				var promote = null;

				if(data.promote) {
					Promote.findOne({code: data.promote}, function(err, doc) {
						if(doc) {
							havePromote = true;
							promote = doc;
						}
					});
				}

				var ship = new Shipping();
				ship.weight = book.weight * order.quantity;
				ship.dimensions = book.width + 'x' + book.depth + 'x' + book.height * order.quantity;
				ship.fee = book.price * order.quantity;
				ship.order = order._id;

				ship.save(function(err) {
					if(err) {
						return res.status(400).json(err);
					}

					book.quantity -= quantity;
					book.save(function(err) {
						if(err) {
							return res.status(400).json(err);
						}
					});
				});

				res.json({
					name: order.name,
					address: order.address,
					sku: order.sku,
					quantity: order.quantity,
					created: order.created
				});
			});
		});
	});

router.route('/search')
	.get(function(req, res) { // search book
		if(req.query.q == null) {
			return res.status(400).json({err: 'Book not found'});
		}

		Book.find({title: new RegExp(regexEscape(req.query.q), 'i')}, '-_id', function(err, docs) {
			if(err) {
				return res.status(400).json(err);
			}

			res.json(docs);
		});
	});

app.use('/api', router);
app.listen(port);
console.log('Server running at ' + port);