import { VALIDATION } from './constants';

export const validateEmail = (email: string): boolean => {
  return VALIDATION.EMAIL_REGEX.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= VALIDATION.MIN_PASSWORD_LENGTH;
};

export const validateUsername = (username: string): boolean => {
  return username.length >= VALIDATION.MIN_USERNAME_LENGTH;
};

export const validateRequiredFields = (...fields: string[]): boolean => {
  return fields.every(field => field && field.trim().length > 0);
};
