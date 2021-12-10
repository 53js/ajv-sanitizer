const {
	escape,
	normalizeEmail,
	toBoolean,
	toDate,
	toFloat,
	toInt,
	trim,
} = require('validator');
const sanitizeHtml = require('sanitize-html');

const boolean = (data) => toBoolean(data, true);
const date = (data) => toDate(data);
const email = (data) => normalizeEmail(data);
const float = (data) => toFloat(data);
const int = (data) => toInt(data);
const text = (data) => trim(escape(data));
const html = (data) => sanitizeHtml(data);

exports.boolean = boolean;
exports.date = date;
exports.email = email;
exports.escape = escape;
exports.float = float;
exports.int = int;
exports.number = float;
exports.text = text;
exports.html = html;
exports.trim = trim;
