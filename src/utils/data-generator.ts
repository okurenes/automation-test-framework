import { faker } from '@faker-js/faker';

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  zipCode: string;
}

export interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CheckoutData {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class DataGenerator {
  static generateUser(): UserData {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
      phone: faker.phone.number(),
      zipCode: faker.location.zipCode(),
    };
  }

  static generateAddress(): AddressData {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
    };
  }

  static generateCheckoutData(): CheckoutData {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      postalCode: faker.location.zipCode(),
    };
  }

  static generateMultipleUsers(count: number): UserData[] {
    return Array.from({ length: count }, () => DataGenerator.generateUser());
  }

  static generateRandomString(length: number): string {
    return faker.string.alphanumeric(length);
  }

  static generateRandomNumber(min: number, max: number): number {
    return faker.number.int({ min, max });
  }

  static generateSpecialCharacters(): string {
    return '<script>alert("XSS")</script>';
  }

  static generateSQLInjection(): string {
    return "' OR '1'='1' --";
  }

  static generateLongString(length = 500): string {
    return faker.lorem.words(length);
  }

  static generateEmptyString(): string {
    return '';
  }

  static generateWhitespace(): string {
    return '   ';
  }

  static getBoundaryTestData(): Record<string, string> {
    return {
      empty: '',
      whitespace: '   ',
      singleChar: 'a',
      maxLength: 'a'.repeat(255),
      specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      unicode: 'test',
      xss: '<script>alert("XSS")</script>',
      sqlInjection: "' OR '1'='1' --",
      htmlTags: '<b>bold</b><i>italic</i>',
      newlines: 'line1\nline2\nline3',
      tabs: 'col1\tcol2\tcol3',
    };
  }
}
