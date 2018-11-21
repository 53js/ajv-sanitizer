# ajv-sanitizer

String sanitization with JSON-Schema using [Ajv](https://www.npmjs.com/package/ajv).

## Strings only

**This library sanitizes strings only.**

It uses the library [validator.js](https://www.npmjs.com/package/validator) under the hood for string sanitizion.

## Installation and Usage

### Installation

Install the library with `npm install ajv-sanitizer`

### Usage

```javascript
const Ajv = require('ajv');
const ajvSanitizer = require('ajv-sanitizer');
const assert = require('assert');

const ajv = new Ajv();
ajvSanitizer(ajv);

const schema = {
	type: 'object',
	properties: {
		value: {
			type: 'string',
			sanitize: 'text',
		},
	},
};

// sanitized data must be an object property
const data = {
	value: ' trim & escape string',
};

ajv.validate(schema, data);

assert(data.value === 'trim &amp; escape string');
```

#### ES6

```javascript
import ajvSanitizer from 'ajv-sanitizer';
```

## Sanitizers

### Available sanitizers

Here is a list of the sanitizers currently available :

* boolean
* date
* email
* escape
* float
* int
* number
* text (escape then trim)
* trim

See [validator.js sanitizers](https://www.npmjs.com/package/validator#user-content-sanitizers) for details

### Custom sanitizer

```javascript
const schema = {
	type: 'object',
	properties: {
		value: {
			type: 'string',
			// Custom sanitizer
			sanitize: data => `-- ${data} --`,
		},
	},
};
```
