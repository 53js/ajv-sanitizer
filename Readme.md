# ajv-sanitizer

String sanitization with JSON-Schema using [Ajv](https://www.npmjs.com/package/ajv).  

[![npm](https://img.shields.io/npm/v/ajv-sanitizer.svg)](https://www.npmjs.com/package/ajv-sanitizer)

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

## API

### ajvSanitize(ajvInstance, [extraSanitizers])

Returns Ajv instance. It adds a sanitize keyword available for string types.

#### ajvInstance

Type: `Ajv`

The ajv instance to add the sanitize keyword.

#### extraSanitizers

Type: `Object`

Extend or override defaults sanitizers available in json schema.

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

Usage of email sanitization with custom options:  
```js
import { normalizeEmail } from 'validator';

const schema = {
	type: 'object',
	properties: {
		value: {
			type: 'string',
			sanitize: email => normalizeEmail(email, { gmail_remove_dots: false }),
		},
	},
};
```
If you want to sanitize email this way in every schema, use the following option


### Extending default sanitizers
Adding a sanitizer or override a default globally :

```js
const Ajv = require('ajv');
const ajvSanitizer = require('ajv-sanitizer');
const { normalizeEmail } = require('validator');

const ajv = new Ajv();

// Define extra sanitizer and override defaults
const extraSanitizers = {
	email: email => normalizeEmail(email, { gmail_remove_dots: false }), // overrides default email sanitizer
	uppercase: text => text.toUpperCase(), // new uppercase sanitizer
};

ajvSanitizer(ajv, extraSanitizers);

const schema = {
	type: 'object',
	properties: {
		email: {
			type: 'string',
			sanitize: 'email',
		},
		lastname: {
			type: 'string',
			sanitize: 'uppercase',
		},
	},
};
```
