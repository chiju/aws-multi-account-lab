// UI Constants
export const COLORS = {
  primary: 'text-sky-500',
  hover: 'hover:underline',
  cursor: 'cursor-pointer',
  link: 'text-sky-500 cursor-pointer hover:underline'
} as const;

// Validation Constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_USERNAME_LENGTH: 3,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
} as const;

// Toast Messages
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Logged in successfully.',
    REGISTER: 'Account created successfully.',
    PROFILE_UPDATED: 'Profile updated successfully.'
  },
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid credentials!',
    INVALID_EMAIL: 'Please enter a valid email!',
    REQUIRED_FIELDS: 'All fields are required!',
    GENERIC: 'Something went wrong.'
  }
} as const;
