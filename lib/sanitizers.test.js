const validator = require('validator');

const {
	boolean,
	date,
	email,
	escape,
	float,
	int,
	number,
	text,
	trim,
} = require('./sanitizers');

jest.mock('validator', () => {
	const validatorOriginal = require.requireActual('validator');

	return {
		escape: jest.fn().mockImplementation(validatorOriginal.escape),
		normalizeEmail: jest.fn().mockImplementation(validatorOriginal.normalizeEmail),
		toBoolean: jest.fn().mockImplementation(validatorOriginal.toBoolean),
		toDate: jest.fn().mockImplementation(validatorOriginal.toDate),
		toFloat: jest.fn().mockImplementation(validatorOriginal.toFloat),
		toInt: jest.fn().mockImplementation(validatorOriginal.toInt),
		trim: jest.fn().mockImplementation(validatorOriginal.trim),
	};
});

const itShouldFailStringAssertion = (sanitizer) => {
	it('should throw a TypeError if data is not a string', () => {
		expect(() => { sanitizer(false); }).toThrow(TypeError);
		expect(() => { sanitizer(null); }).toThrow(TypeError);
		expect(() => { sanitizer({}); }).toThrow(TypeError);
		expect(() => { sanitizer([]); }).toThrow(TypeError);
		expect(() => { sanitizer(1); }).toThrow(TypeError);
	});
};

beforeEach(() => {
	validator.escape.mockClear();
	validator.normalizeEmail.mockClear();
	validator.toBoolean.mockClear();
	validator.toDate.mockClear();
	validator.toFloat.mockClear();
	validator.toInt.mockClear();
	validator.trim.mockClear();
});

describe('boolean(data)', () => {
	itShouldFailStringAssertion(boolean);

	it('should call validator.toBoolean with strict option', () => {
		boolean('true');
		expect(validator.toBoolean).toHaveBeenCalledWith('true', true);
	});

	it('should return a boolean using strict behavior', () => {
		expect(boolean('true')).toStrictEqual(true);
		expect(boolean('falsy_value')).toStrictEqual(false);
	});
});

describe('date(data)', () => {
	const dateStr = new Date().toISOString();

	itShouldFailStringAssertion(date);

	it('should call validator.toDate', () => {
		date(dateStr);
		expect(validator.toDate).toHaveBeenCalledWith(dateStr);
	});

	it('should return a date', () => {
		expect(date(dateStr)).toBeInstanceOf(Date);
		expect(date(dateStr.substr(0, 10))).toBeInstanceOf(Date);
	});
});

describe('email(data)', () => {
	const emailStr = 'MAIL@DOMAIN.TLD';

	itShouldFailStringAssertion(email);

	it('should call validator.normalizeEmail', () => {
		email(emailStr);
		expect(validator.normalizeEmail).toHaveBeenCalledWith(emailStr);
	});

	it('should return a sanitized email', () => {
		expect(email(emailStr)).toEqual('mail@domain.tld');
	});
});

describe('escape(data)', () => {
	const str = '<tag';

	itShouldFailStringAssertion(escape);

	it('should call validator.escape', () => {
		escape(str);
		expect(validator.escape).toHaveBeenCalledWith(str);
	});

	it('should return an escaped string', () => {
		expect(escape(str)).toEqual('&lt;tag');
	});
});

describe('float(data), number(data)', () => {
	const floatStr = '1.0';

	itShouldFailStringAssertion(float);
	itShouldFailStringAssertion(number);

	it('should call validator.toFloat', () => {
		validator.toFloat.mockClear();
		float(floatStr);
		expect(validator.toFloat).toHaveBeenCalledWith(floatStr);
		validator.toFloat.mockClear();
		number(floatStr);
		expect(validator.toFloat).toHaveBeenCalledWith(floatStr);
	});

	it('should return a float', () => {
		expect(float(floatStr)).toStrictEqual(1.0);
		expect(number(floatStr)).toStrictEqual(1.0);
	});
});

describe('int(data)', () => {
	const intStr = '1';

	itShouldFailStringAssertion(int);

	it('should call validator.toInt', () => {
		validator.toInt.mockClear();
		int(intStr);
		expect(validator.toInt).toHaveBeenCalledWith(intStr);
	});

	it('should return an integer', () => {
		expect(int(intStr)).toStrictEqual(1);
	});
});

describe('text(data)', () => {
	const str = ' <tag ';

	itShouldFailStringAssertion(text);

	it('should call validator.escape and validator.trim', () => {
		text(str);
		expect(validator.escape).toHaveBeenNthCalledWith(1, str);
		expect(validator.trim).toHaveBeenCalledWith(' &lt;tag ');
	});

	it('should return an escaped and trimmed string', () => {
		expect(text(str)).toEqual('&lt;tag');
	});
});

describe('trim(data)', () => {
	const str = ' str ';

	itShouldFailStringAssertion(trim);

	it('should call validator.trim', () => {
		trim(str);
		expect(validator.trim).toHaveBeenCalledWith(str);
	});

	it('should return an trimmed string', () => {
		expect(trim(str)).toEqual('str');
	});
});
