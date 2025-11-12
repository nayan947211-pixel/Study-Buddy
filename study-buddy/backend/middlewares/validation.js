const validator = require('validator');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      
      // Required field check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      
      // Skip validation for optional empty fields
      if (!value && !rules.required) continue;
      
      // Type validation
      if (rules.type) {
        switch (rules.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push(`${field} must be a string`);
            }
            break;
          case 'number':
            if (typeof value !== 'number' && isNaN(Number(value))) {
              errors.push(`${field} must be a number`);
            }
            break;
          case 'email':
            if (!validator.isEmail(value)) {
              errors.push(`${field} must be a valid email`);
            }
            break;
          case 'array':
            if (!Array.isArray(value)) {
              errors.push(`${field} must be an array`);
            }
            break;
        }
      }
      
      // Length validation
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must not exceed ${rules.maxLength} characters`);
      }
      
      // Min/Max value validation
      if (rules.min !== undefined && Number(value) < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      
      if (rules.max !== undefined && Number(value) > rules.max) {
        errors.push(`${field} must not exceed ${rules.max}`);
      }
      
      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }
      
      // Custom validation
      if (rules.custom && !rules.custom(value)) {
        errors.push(rules.customMessage || `${field} is invalid`);
      }
      
      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

// Common validation schemas
const authValidation = {
  register: validate({
    username: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9_]+$/,
      customMessage: 'Username can only contain letters, numbers, and underscores'
    },
    email: {
      required: true,
      type: 'email'
    },
    password: {
      required: true,
      type: 'string',
      minLength: 6,
      maxLength: 100
    }
  }),
  
  login: validate({
    email: {
      required: true,
      type: 'email'
    },
    password: {
      required: true,
      type: 'string'
    }
  })
};

const quizValidation = {
  generate: validate({
    text: {
      required: true,
      type: 'string',
      minLength: 100,
      maxLength: 500000
    },
    numQuestions: {
      required: false,
      type: 'number',
      min: 1,
      max: 50
    },
    difficulty: {
      required: false,
      type: 'string',
      enum: ['easy', 'medium', 'hard']
    },
    title: {
      required: false,
      type: 'string',
      maxLength: 200
    }
  })
};

const flashcardValidation = {
  generate: validate({
    text: {
      required: true,
      type: 'string',
      minLength: 100,
      maxLength: 500000
    },
    title: {
      required: false,
      type: 'string',
      maxLength: 200
    }
  })
};

const plannerValidation = {
  addTopic: validate({
    title: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 200
    },
    description: {
      required: false,
      type: 'string',
      maxLength: 1000
    },
    difficulty: {
      required: false,
      type: 'string',
      enum: ['easy', 'medium', 'hard']
    },
    priority: {
      required: false,
      type: 'string',
      enum: ['low', 'medium', 'high']
    },
    estimatedTime: {
      required: false,
      type: 'number',
      min: 5,
      max: 480
    }
  })
};

const analyticsValidation = {
  quizAttempt: validate({
    quizId: {
      required: true,
      type: 'string'
    },
    score: {
      required: true,
      type: 'number',
      min: 0
    },
    totalQuestions: {
      required: true,
      type: 'number',
      min: 1
    },
    timeSpent: {
      required: false,
      type: 'number',
      min: 0
    }
  }),
  
  flashcardSession: validate({
    flashcardSetId: {
      required: true,
      type: 'string'
    },
    cardsReviewed: {
      required: true,
      type: 'number',
      min: 1
    },
    timeSpent: {
      required: false,
      type: 'number',
      min: 0
    }
  }),
  
  studySession: validate({
    activityType: {
      required: true,
      type: 'string',
      enum: ['quiz', 'flashcard', 'planner', 'chat']
    },
    duration: {
      required: true,
      type: 'number',
      min: 1
    }
  })
};

// Sanitization helper
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return validator.escape(input.trim());
  }
  return input;
};

// Sanitization middleware
const sanitize = (fields) => {
  return (req, res, next) => {
    fields.forEach(field => {
      if (req.body[field]) {
        req.body[field] = sanitizeInput(req.body[field]);
      }
    });
    next();
  };
};

module.exports = {
  validate,
  authValidation,
  quizValidation,
  flashcardValidation,
  plannerValidation,
  analyticsValidation,
  sanitize,
  sanitizeInput
};
