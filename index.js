const sanitizers = require('./lib/sanitizers');

const ajvSanitizer = (ajv) => {
	ajv.addKeyword('sanitize', {
		modifying: true,
		compile: function compile(schema) {
			let sanitize;

			if (typeof schema === 'string') {
				sanitize = sanitizers[schema];
			}

			if (typeof schema === 'function') {
				sanitize = schema;
			}

			if (!sanitize) {
				throw new TypeError('Unknown sanitizer');
			}

			return (data, currentDataPath, parentDataObject, propertyName, rootData) => {
				if (!propertyName) throw new TypeError('Data must be a property of an object');
				rootData[propertyName] = sanitize(data);
				return true;
			};
		},
		errors: false,
	});

	return ajv;
};

module.exports = ajvSanitizer;
