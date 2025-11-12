const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Quiz = require('./models/quiz');
const Flashcard = require('./models/Flashcard');
const StudyTopic = require('./models/StudyTopic');
const Analytics = require('./models/Analytics');

// Connect to database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed data for nayankumar@gmail.com...\n');

    // 1. Find or create user
    let user = await User.findOne({ email: 'nayankumar@gmail.com' });
    
    if (!user) {
      console.log('Creating new user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = new User({
        username: 'Nayan Kumar',
        email: 'nayankumar@gmail.com',
        password: hashedPassword
      });
      await user.save();
      console.log('✅ User created');
    } else {
      console.log('✅ User already exists');
    }

    const userId = user._id;

    // 2. Clear existing data for this user
    console.log('\n🗑️  Clearing existing data...');
    await Quiz.deleteMany({ createdBy: userId });
    await Flashcard.deleteMany({ createdBy: userId });
    await StudyTopic.deleteMany({ createdBy: userId });
    await Analytics.deleteMany({ userId: userId });
    console.log('✅ Old data cleared');

    // 3. Create Quizzes
    console.log('\n📝 Creating quizzes...');
    const quizzes = [
      {
        title: 'JavaScript Fundamentals',
        description: 'Test your knowledge of basic JavaScript concepts',
        questions: [
          {
            question: 'What is the difference between let and var?',
            options: [
              'let is block-scoped, var is function-scoped',
              'let is function-scoped, var is block-scoped',
              'There is no difference',
              'let cannot be reassigned'
            ],
            correctAnswer: 'A',
            explanation: 'let is block-scoped while var is function-scoped, making let safer in most scenarios.',
            difficulty: 'medium'
          },
          {
            question: 'What does === do in JavaScript?',
            options: [
              'Assigns a value',
              'Compares values with type coercion',
              'Compares values without type coercion',
              'Checks if value exists'
            ],
            correctAnswer: 'C',
            explanation: '=== performs strict equality comparison without type coercion.',
            difficulty: 'easy'
          },
          {
            question: 'What is a closure in JavaScript?',
            options: [
              'A function that has access to its outer function scope',
              'A way to close files',
              'A method to end a program',
              'A type of loop'
            ],
            correctAnswer: 'A',
            explanation: 'A closure is a function that retains access to its outer scope even after the outer function has returned.',
            difficulty: 'hard'
          },
          {
            question: 'What is the purpose of async/await?',
            options: [
              'To make synchronous code',
              'To handle asynchronous operations more cleanly',
              'To speed up code execution',
              'To create multiple threads'
            ],
            correctAnswer: 'B',
            explanation: 'async/await provides a cleaner syntax for working with Promises and asynchronous code.',
            difficulty: 'medium'
          },
          {
            question: 'What does the spread operator (...) do?',
            options: [
              'Divides numbers',
              'Expands an iterable into individual elements',
              'Creates a range',
              'Multiplies arrays'
            ],
            correctAnswer: 'B',
            explanation: 'The spread operator expands an iterable (like an array) into individual elements.',
            difficulty: 'medium'
          }
        ],
        createdBy: userId,
        generatedFrom: 'pdf'
      },
      {
        title: 'React Basics Quiz',
        description: 'Essential React concepts and hooks',
        questions: [
          {
            question: 'What is JSX?',
            options: [
              'A JavaScript library',
              'JavaScript XML - syntax extension for JavaScript',
              'A CSS framework',
              'A database query language'
            ],
            correctAnswer: 'B',
            explanation: 'JSX is a syntax extension that allows you to write HTML-like code in JavaScript.',
            difficulty: 'easy'
          },
          {
            question: 'What is the purpose of useState hook?',
            options: [
              'To manage side effects',
              'To add state to functional components',
              'To fetch data',
              'To optimize performance'
            ],
            correctAnswer: 'B',
            explanation: 'useState allows functional components to have state variables.',
            difficulty: 'easy'
          },
          {
            question: 'When does useEffect run?',
            options: [
              'Only once when component mounts',
              'Only when state changes',
              'After every render by default',
              'Before component renders'
            ],
            correctAnswer: 'C',
            explanation: 'useEffect runs after every render by default, but can be controlled with dependencies.',
            difficulty: 'medium'
          },
          {
            question: 'What is prop drilling?',
            options: [
              'A drilling technique',
              'Passing props through multiple component layers',
              'A performance optimization',
              'A testing method'
            ],
            correctAnswer: 'B',
            explanation: 'Prop drilling is passing props through intermediate components that don\'t need them.',
            difficulty: 'medium'
          }
        ],
        createdBy: userId,
        generatedFrom: 'pdf'
      },
      {
        title: 'Python Data Structures',
        description: 'Lists, Tuples, Dictionaries, and Sets',
        questions: [
          {
            question: 'Which data structure is immutable in Python?',
            options: ['List', 'Dictionary', 'Tuple', 'Set'],
            correctAnswer: 'C',
            explanation: 'Tuples are immutable, meaning they cannot be changed after creation.',
            difficulty: 'easy'
          },
          {
            question: 'How do you access a dictionary value by key?',
            options: [
              'dict.get(key) or dict[key]',
              'dict.value(key)',
              'dict->key',
              'dict.key'
            ],
            correctAnswer: 'A',
            explanation: 'You can use dict[key] or dict.get(key), with .get() being safer as it won\'t raise an error.',
            difficulty: 'easy'
          },
          {
            question: 'What is list comprehension?',
            options: [
              'A way to understand lists',
              'A concise way to create lists',
              'A list method',
              'A type of loop'
            ],
            correctAnswer: 'B',
            explanation: 'List comprehension provides a concise syntax to create lists: [x for x in range(10)]',
            difficulty: 'medium'
          }
        ],
        createdBy: userId,
        generatedFrom: 'pdf'
      }
    ];

    const createdQuizzes = await Quiz.insertMany(quizzes);
    console.log(`✅ Created ${createdQuizzes.length} quizzes`);

    // 4. Create Flashcards
    console.log('\n🎴 Creating flashcard sets...');
    const flashcardSets = [
      {
        title: 'Web Development Terms',
        cards: [
          { question: 'What is DOM?', answer: 'Document Object Model - a programming interface for HTML and XML documents that represents the page structure as a tree of objects.' },
          { question: 'What is API?', answer: 'Application Programming Interface - a set of rules and protocols that allows different software applications to communicate with each other.' },
          { question: 'What is REST?', answer: 'Representational State Transfer - an architectural style for designing networked applications using HTTP methods.' },
          { question: 'What is JSON?', answer: 'JavaScript Object Notation - a lightweight data interchange format that is easy for humans to read and write.' },
          { question: 'What is AJAX?', answer: 'Asynchronous JavaScript and XML - a technique for creating dynamic web pages by exchanging data with a server asynchronously.' },
          { question: 'What is CDN?', answer: 'Content Delivery Network - a system of distributed servers that deliver web content based on geographic location.' },
          { question: 'What is CORS?', answer: 'Cross-Origin Resource Sharing - a mechanism that allows restricted resources on a web page to be requested from another domain.' },
          { question: 'What is JWT?', answer: 'JSON Web Token - a compact and self-contained way of transmitting information between parties as a JSON object.' }
        ],
        createdBy: userId
      },
      {
        title: 'Database Concepts',
        cards: [
          { question: 'What is SQL?', answer: 'Structured Query Language - a standard language for accessing and manipulating relational databases.' },
          { question: 'What is NoSQL?', answer: 'Not Only SQL - a database approach that can store and retrieve data not in tabular relations (non-relational databases).' },
          { question: 'What is ACID?', answer: 'Atomicity, Consistency, Isolation, Durability - properties that guarantee database transactions are processed reliably.' },
          { question: 'What is Normalization?', answer: 'The process of organizing data in a database to reduce redundancy and improve data integrity.' },
          { question: 'What is an Index?', answer: 'A database object that improves the speed of data retrieval operations on a table.' },
          { question: 'What is a Primary Key?', answer: 'A unique identifier for each record in a database table.' },
          { question: 'What is a Foreign Key?', answer: 'A field in one table that refers to the primary key in another table, creating a relationship between the tables.' }
        ],
        createdBy: userId
      },
      {
        title: 'Data Science Basics',
        cards: [
          { question: 'What is Machine Learning?', answer: 'A subset of AI that enables systems to learn and improve from experience without being explicitly programmed.' },
          { question: 'What is Supervised Learning?', answer: 'A type of machine learning where the model is trained on labeled data.' },
          { question: 'What is Unsupervised Learning?', answer: 'A type of machine learning where the model finds patterns in unlabeled data.' },
          { question: 'What is Neural Network?', answer: 'A computing system inspired by biological neural networks that can learn to perform tasks by considering examples.' },
          { question: 'What is Overfitting?', answer: 'When a model learns the training data too well, including noise and outliers, reducing its ability to generalize.' },
          { question: 'What is Data Preprocessing?', answer: 'The process of cleaning, transforming, and organizing raw data before analysis or modeling.' }
        ],
        createdBy: userId
      },
      {
        title: 'Computer Networks',
        cards: [
          { question: 'What is TCP/IP?', answer: 'Transmission Control Protocol/Internet Protocol - the fundamental communication protocols of the internet.' },
          { question: 'What is DNS?', answer: 'Domain Name System - translates domain names to IP addresses so browsers can load internet resources.' },
          { question: 'What is HTTP/HTTPS?', answer: 'HyperText Transfer Protocol (Secure) - protocols for transmitting web pages over the internet.' },
          { question: 'What is a Firewall?', answer: 'A network security system that monitors and controls incoming and outgoing network traffic.' },
          { question: 'What is a Router?', answer: 'A networking device that forwards data packets between computer networks.' }
        ],
        createdBy: userId
      }
    ];

    const createdFlashcards = await Flashcard.insertMany(flashcardSets);
    console.log(`✅ Created ${createdFlashcards.length} flashcard sets`);

    // 5. Create Study Topics (Planner)
    console.log('\n📅 Creating study planner topics...');
    const today = new Date();
    const studyTopics = [
      {
        title: 'Complete React Course - Week 1',
        description: 'Cover React basics, components, props, and state management',
        scheduledFor: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        difficulty: 'medium',
        estimatedTime: 120,
        priority: 'high',
        completed: false,
        createdBy: userId
      },
      {
        title: 'Learn Node.js and Express',
        description: 'Build RESTful APIs with Node.js and Express framework',
        scheduledFor: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days
        difficulty: 'medium',
        estimatedTime: 180,
        priority: 'high',
        completed: false,
        createdBy: userId
      },
      {
        title: 'Database Design Project',
        description: 'Design and implement a MongoDB schema for e-commerce application',
        scheduledFor: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days
        difficulty: 'hard',
        estimatedTime: 240,
        priority: 'medium',
        completed: false,
        createdBy: userId
      },
      {
        title: 'Practice LeetCode Problems',
        description: 'Solve 5 medium difficulty algorithm problems daily',
        scheduledFor: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
        difficulty: 'hard',
        estimatedTime: 60,
        priority: 'medium',
        completed: false,
        createdBy: userId
      },
      {
        title: 'Study AWS Fundamentals',
        description: 'Learn EC2, S3, Lambda, and basic cloud concepts',
        scheduledFor: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days
        difficulty: 'easy',
        estimatedTime: 90,
        priority: 'low',
        completed: false,
        createdBy: userId
      },
      {
        title: 'Review TypeScript Basics',
        description: 'Go through TypeScript fundamentals and type system',
        scheduledFor: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (completed)
        difficulty: 'easy',
        estimatedTime: 60,
        priority: 'high',
        completed: true,
        completedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        createdBy: userId
      },
      {
        title: 'Git and GitHub Mastery',
        description: 'Learn branching, merging, rebasing, and collaboration workflows',
        scheduledFor: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (completed)
        difficulty: 'easy',
        estimatedTime: 45,
        priority: 'medium',
        completed: true,
        completedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        createdBy: userId
      }
    ];

    const createdTopics = await StudyTopic.insertMany(studyTopics);
    console.log(`✅ Created ${createdTopics.length} study topics`);

    // 6. Create Analytics Data
    console.log('\n📊 Creating analytics data...');
    
    // Create quiz attempts
    const quizAttempts = [
      {
        quizId: createdQuizzes[0]._id,
        score: 4,
        totalQuestions: 5,
        percentage: 80,
        timeSpent: 180,
        completedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        quizId: createdQuizzes[0]._id,
        score: 5,
        totalQuestions: 5,
        percentage: 100,
        timeSpent: 150,
        completedAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        quizId: createdQuizzes[1]._id,
        score: 3,
        totalQuestions: 4,
        percentage: 75,
        timeSpent: 120,
        completedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        quizId: createdQuizzes[2]._id,
        score: 2,
        totalQuestions: 3,
        percentage: 66.67,
        timeSpent: 90,
        completedAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        quizId: createdQuizzes[1]._id,
        score: 4,
        totalQuestions: 4,
        percentage: 100,
        timeSpent: 100,
        completedAt: new Date()
      }
    ];

    // Create flashcard study sessions
    const flashcardStudy = [
      {
        flashcardSetId: createdFlashcards[0]._id,
        cardsReviewed: 8,
        timeSpent: 240,
        studiedAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        flashcardSetId: createdFlashcards[1]._id,
        cardsReviewed: 7,
        timeSpent: 210,
        studiedAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        flashcardSetId: createdFlashcards[2]._id,
        cardsReviewed: 6,
        timeSpent: 180,
        studiedAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        flashcardSetId: createdFlashcards[3]._id,
        cardsReviewed: 5,
        timeSpent: 150,
        studiedAt: new Date()
      }
    ];

    // Create study sessions
    const studySessions = [
      { activityType: 'quiz', duration: 3, date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000) },
      { activityType: 'flashcard', duration: 4, date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000) },
      { activityType: 'quiz', duration: 2.5, date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000) },
      { activityType: 'flashcard', duration: 3.5, date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000) },
      { activityType: 'quiz', duration: 2, date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) },
      { activityType: 'planner', duration: 1.5, date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) },
      { activityType: 'quiz', duration: 1.5, date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000) },
      { activityType: 'flashcard', duration: 3, date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000) },
      { activityType: 'quiz', duration: 1.67, date: new Date() },
      { activityType: 'flashcard', duration: 2.5, date: new Date() },
      { activityType: 'planner', duration: 1, date: new Date() }
    ];

    const analytics = new Analytics({
      userId: userId,
      quizAttempts: quizAttempts,
      flashcardStudy: flashcardStudy,
      studySessions: studySessions,
      streak: {
        current: 5,
        longest: 7,
        lastStudyDate: new Date()
      }
    });

    // Calculate stats
    analytics.updateStats();
    await analytics.save();
    
    console.log('✅ Created analytics data');
    console.log(`   - ${quizAttempts.length} quiz attempts`);
    console.log(`   - ${flashcardStudy.length} flashcard sessions`);
    console.log(`   - ${studySessions.length} study sessions`);
    console.log(`   - Current streak: ${analytics.streak.current} days`);
    console.log(`   - Total study time: ${analytics.totalStudyTime} minutes`);
    console.log(`   - Average quiz score: ${analytics.averageQuizScore.toFixed(2)}%`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📧 User credentials:');
    console.log('   Email: nayankumar@gmail.com');
    console.log('   Password: password123');
    console.log('\n🎉 You can now login and explore all the features!');

    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedData();
