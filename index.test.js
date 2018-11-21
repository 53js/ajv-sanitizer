const Ajv = require('ajv');

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
			sanitize: d => `${d}!`,
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
});
