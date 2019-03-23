const {
	escape,
	normalizeEmail,
	toBoolean,
	toDate,
	toFloat,
	toInt,
	trim,
} = require('validator');

const boolean = data => toBoolean(data, true);
const date = data => toDate(data);
const email = data => normalizeEmail(data);
const emailKeepDots = data => normalizeEmail(data, {gmail_remove_dots: false});
const float = data => toFloat(data);
const int = data => toInt(data);
const text = data => trim(escape(data));

exports.boolean = boolean;
exports.date = date;
exports.email = email;
exports.emailKeepDots = emailKeepDots;
exports.escape = escape;
exports.float = float;
exports.int = int;
exports.number = float;
exports.text = text;
exports.trim = trim;
