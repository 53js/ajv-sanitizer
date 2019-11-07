const Ajv = require('ajv');
const { normalizeEmail } = require('validator');

const ajvSanitizer = require('.');

const mockAddKeyword = jest.fn();
jest.mock('ajv', () => (
	jest.fn().mockImplementation(() => ({ addKeyword: mockAddKeyword }))
));
const AjvOriginal = jest.requireActual('ajv');

let ajv;

const schema = {
	type: 'object',
	properties: {
		fieldBoolean: {
			type: 'string',
			sanitize: 'boolean',
		},
		fieldDate: {
			type: 'string',
			sanitize: 'date',
		},
		fieldEmail: {
			type: 'string',
			sanitize: 'email',
		},
		fieldEscape: {
			type: 'string',
			sanitize: 'escape',
		},
		fieldFloat: {
			type: 'string',
			sanitize: 'float',
		},
		fieldInt: {
			type: 'string',
			sanitize: 'int',
		},
		fieldNumber: {
			type: 'string',
			sanitize: 'number',
		},
		fieldString: {
			type: 'string',
			sanitize: 'text',
		},
		fieldTrim: {
			type: 'string',
			sanitize: 'trim',
		},
	},
};

const data = {
	fieldBoolean: 'true',
	fieldDate: new Date().toISOString(),
	fieldEmail: 'MAIL@DOMAIN.TLD',
	fieldEscape: '<tag',
	fieldFloat: '1.0',
	fieldInt: '1',
	fieldNumber: '1.0',
	fieldString: ' <tag ',
	fieldTrim: ' str ',
};

const schemaFunction = {
	type: 'object',
	properties: {
		fieldFunction: {
			type: 'string',
			sanitize: (d) => `${d}!`,
		},
	},
};

const dataFunction = {
	fieldFunction: 'hello',
};

const schemaUnknownSanitizer = {
	type: 'object',
	properties: {
		fieldFunction: {
			type: 'string',
			sanitize: 'unknown_sanitizer',
		},
	},
};

const schemaUndefinedSanitizer = {
	type: 'object',
	properties: {
		fieldFunction: {
			type: 'string',
			sanitize: null,
		},
	},
};

const schemaDeep = {
	type: 'object',
	properties: {
		parentObject: {
			type: 'object',
			properties: {
				fieldNumber: {
					type: 'string',
					sanitize: 'number',
				},
			},
		},
	},
};

const schemaArray = {
	type: 'array',
	items: {
		type: 'string',
		sanitize: 'escape',
	},
};

const schemaArrayOfObjects = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			fieldText: {
				type: 'string',
				sanitize: 'escape',
			},
		},
	},
};

beforeEach(() => {
	ajv = ajvSanitizer(new AjvOriginal());
	Ajv.mockClear();
});

describe('ajvSanitizer(ajv)', () => {
	it('should add a sanitize keyword to Ajv instance', () => {
		ajvSanitizer(new Ajv());
		expect(mockAddKeyword).toHaveBeenCalledWith(
			'sanitize',
			{
				modifying: true,
				compile: expect.any(Function),
				errors: false,
			},
		);
	});

	it(
		`should allow to sanitize string values by sanitizer name
(one of: boolean, date, email, escape, float, int, number, text, trim)`,
		() => {
			const dataCopy = { ...data };
			const validate = ajv.compile(schema);
			const result = validate(dataCopy);

			expect(result).toEqual(true);
			expect(dataCopy.fieldBoolean).toEqual(true);
			expect(dataCopy.fieldDate).toEqual(new Date(Date.parse(data.fieldDate)));
			expect(dataCopy.fieldEmail).toEqual(data.fieldEmail.toLowerCase());
			expect(dataCopy.fieldEscape).toEqual('&lt;tag');
			expect(dataCopy.fieldFloat).toEqual(1.0);
			expect(dataCopy.fieldInt).toEqual(1);
			expect(dataCopy.fieldNumber).toEqual(1.0);
			expect(dataCopy.fieldString).toEqual('&lt;tag');
			expect(dataCopy.fieldTrim).toEqual('str');
		},
	);

	it(
		'should allow to sanitize string values by passing a sanitizer function',
		() => {
			const dataFunctionCopy = { ...dataFunction };
			const validate = ajv.compile(schemaFunction);
			const result = validate(dataFunctionCopy);

			expect(result).toEqual(true);
			expect(dataFunctionCopy.fieldFunction).toEqual('hello!');
		},
	);

	it(
		'should throw a TypeError if sanitizer is unknown or undefined',
		() => {
			expect(() => ajv.compile(schemaUnknownSanitizer)).toThrow(TypeError);
			expect(() => ajv.compile(schemaUndefinedSanitizer)).toThrow(TypeError);
		},
	);

	it(
		'should throw a TypeError when sanitizing a string which is not a property of an object',
		() => {
			expect(() => (
				ajv.validate({ type: 'string', sanitize: 'boolean' }, 'true')
			)).toThrow(TypeError);
		},
	);

	it(
		'should modify the object deeply',
		() => {
			const dataDeep = {
				parentObject: {
					fieldNumber: '33',
				},
			};

			expect(ajv.validate(schemaDeep, dataDeep)).toBe(true);
			expect(dataDeep).toEqual({ parentObject: { fieldNumber: 33 } });
		},
	);

	it(
		'can be extented with custom sanitizers',
		() => {
			const uppercase = jest.fn((value) => value.toUpperCase());

			const extendedAjv = ajvSanitizer(
				new AjvOriginal(),
				{ uppercase },
			);

			const extendedSchema = {
				type: 'object',
				properties: {
					shouldBeUppercase: {
						type: 'string',
						sanitize: 'uppercase',
					},
				},
			};

			const extendedData = {
				shouldBeUppercase: 'text',
			};

			expect(extendedAjv.validate(extendedSchema, extendedData)).toBe(true);
			expect(uppercase).toHaveBeenCalled();
			expect(extendedData).toEqual({ shouldBeUppercase: 'TEXT' });
		},
	);

	it(
		'can be extented with custom sanitizers overriding defaults',
		() => {
			const emailKeepDots = jest.fn(
				(value) => normalizeEmail(value, { gmail_remove_dots: false }),
			);

			const overrideAjv = ajvSanitizer(
				new AjvOriginal(),
				{ email: emailKeepDots },
			);

			const overrideSchema = {
				type: 'object',
				properties: {
					shouldHaveDots: {
						type: 'string',
						sanitize: 'email',
					},
				},
			};

			const overrideData = {
				shouldHaveDots: 'test.test@gmail.com',
			};

			expect(overrideAjv.validate(overrideSchema, overrideData)).toBe(true);
			expect(emailKeepDots).toHaveBeenCalled();
			expect(overrideData).toEqual({ shouldHaveDots: 'test.test@gmail.com' });
		},
	);

	it(
		'should sanitize arrays',
		() => {
			const dataArr = ['&nbsp;'];
			const dataArrOfObjects = [{ fieldText: '&nbsp;' }];

			expect(ajv.validate(schemaArray, dataArr)).toBe(true);
			expect(ajv.validate(schemaArrayOfObjects, dataArrOfObjects)).toBe(true);

			expect(dataArr).toEqual(['&amp;nbsp;']);
			expect(dataArrOfObjects).toEqual([{ fieldText: '&amp;nbsp;' }]);
		},
	);
});
