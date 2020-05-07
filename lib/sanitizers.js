const {
	escape,
	normalizeEmail,
	toBoolean,
	toDate,
	toFloat,
	toInt,
	trim,
} = require('validator');

const boolean = (data) => data != null ? toBoolean(data, true) : null;
const date = (data) => data != null ? toDate(data) : null;
const email = (data) => data != null ? normalizeEmail(data) : null;
const float = (data) => data != null ? toFloat(data) : null;
const int = (data) => data != null ? toInt(data) : null;
const text = (data) => data != null ? trim(escape(data)) : null;

exports.boolean = boolean;
exports.date = date;
exports.email = email;
exports.escape = escape;
exports.float = float;
exports.int = int;
exports.number = float;
exports.text = text;
exports.trim = trim;
