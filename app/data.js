'use strict';

var Mongodb = require('mongodb').MongoClient;
var uuid = require('node-uuid');

var books = ['How to Win Friends and Influence People', 'Who Moved My Cheese?', 'Learn Python The Hard Way',
'The 7 Habits of Highly Effective People', 'Designing for Emotion', 'Responsive Web Design',
'Getting Real', 'Getting Things Done - The Art Of Stress Free Productivity', "Don't Make Me Think",
'Content Strategy for Mobile', 'The Elements of Content Strategy', 'Mobile First', 'Learn C The Hard Way',
'Testing management skills - Six tests to assess management and leadership skills', 'Rework',
'Responsive Design', 'The Art of The Start', 'The Definitive Guide to Growth Hacking', 'The Lean Startup',
'The Code Book: The Science of Secrecy from Ancient Egypt to Quantum Cryptography', 'BISL 01 - Universe',
'The Code Book: The Secret History of Codes and Code-breaking', 'BISL 02 - Rocks and Minerals',
'BISL 03 - Volcanoes and Earthquakes', 'BISL 04 - Weather and Climate', 'BISL 05 - Evolution and Genetics',
'BISL 06 - Plants, Algae and Fungi', 'BISL 07 - Invertebrates', 'BISL 08 - Fish and Amphibians',
'BISL 09 - Reptiles and Dinosaurs', 'BISL 10 - Birds', 'BISL 11 - Mammals', 'BISL 12 - Human Body 01',
'BISL 13 - Human Body 02', 'BISL 14 - Energy and Movement', 'BISL 16 - Space Exploration',
'97 Things Every Programmer Should Know - Extended', 'Python for Kids - A Playful Introduction to Programming',
'The C Programming Language 2e', 'Beginning Programming with Java For Dummies 3e', 'Learn Regex The Hard Way',
'Java For Dummies 6e', 'Think Java - How to Think Like a Computer Scientist', 'Learn SQL The Hard Way',
'Think Python - How to Think Like a Computer Scientist 2e', 'Learn Ruby The Hard Way', 'BISL 15 - Technology',
"Fermat's Last Theorem: The Story Of A Riddle That Confounded The World's Greatest Minds For 358 Years",
'Thinking in Python - Design Patterns and Problem-Solving Techniques', 'Thinking in Java 4e'];

function ranInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rand(min, max) {
	return Math.random() * (max - min) + min;
}

function ranStr(len, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
	var text = '';
	for(var i = 0; i < len; i++) {
		text += chars[Math.floor(Math.random() * chars.length)];
	}
	return text;
}

function addData() {
	Mongodb.connect('mongodb://localhost:27017/db1', function(err, db) {
		if(err) {
			return console.log(err);
		}

		var i, doc, t;
		var count = 0;
		var cb = function(err) {
			if(err) {
				console.log(err);
			}

			count--;
			if(count == 0) {
				console.log('Done!');
				db.close();
			}
		};

		var col = db.collection('BookType');
		var bookTypeBatch = col.initializeUnorderedBulkOp();
		var bookType = ['pdf', 'paper'];
		for(i = 0; i < 2; i++) {
			doc = {
				id: i + 1,
				type: bookType[i]
			};
			bookTypeBatch.insert(doc);
		}

		count++;
		bookTypeBatch.execute(cb);

		col = db.collection('Book');
		var bookBatch = col.initializeUnorderedBulkOp();
		books.forEach(function(e) {
			t = ranInt(1, 2);
			doc = {
				sku: uuid.v4(),
				type: t,
				title: e,
				description: '',
				price: ranInt(15, 85),
				quantity: ranInt(20, 100),
				weight: t == 1 ? 0 : rand(0.1, 1).toFixed(2),
				width: rand(15, 30).toFixed(2),
				depth: rand(15, 22).toFixed(2),
				height: rand(1, 3).toFixed(2)
			};
			bookBatch.insert(doc);
		});

		count++;
		bookBatch.execute(cb);

		var promoteType = ['Coupon code', 'Discount code', 'Directly discount'];
		col = db.collection('PromoteType');
		var promoteTypeBatch = col.initializeUnorderedBulkOp();
		for(i = 0; i < 3; i++) {
			doc = {
				id: i + 1,
				type: promoteType[i]
			};
			promoteTypeBatch.insert(doc);
		}

		count++;
		promoteTypeBatch.execute(cb);

		var discount = ['5%', '10%', '20%', '50%', '5', '10', '20', '50', '100'];
		var type = 0;
		var amount = 0;
		col = db.collection('Promote');
		var promoteBatch = col.initializeUnorderedBulkOp();
		for(i = 0; i < 6; i++) {
			type = Math.floor(0.5 * i) + 1;
			amount = Math.floor(Math.random() * discount.length);
			doc = {
				code: ranStr(10),
				type: type,
				details: promoteType[type - 1] + ': -' + discount[amount],
				amount: discount[amount]
			}
			promoteBatch.insert(doc);
		}

		count++;
		promoteBatch.execute(cb);
	});
}

addData();