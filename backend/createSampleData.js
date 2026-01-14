const mongoose = require('mongoose');
require('dotenv').config();

// Booth Schema
const boothSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  media: {
    logoUrl: String,
    audioUrl: String,
    videoUrl: String
  },
  resources: [{
    label: String,
    url: String,
    type: { type: String, enum: ['pdf', 'link', 'video', 'document'] }
  }],
  metadata: {
    tag: String,
    contactInfo: {
      email: String,
      phone: String,
      website: String
    }
  },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

// Question Schema
const questionSchema = new mongoose.Schema({
  booth: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth', required: true },
  question: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  explanation: String,
  points: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Booth = mongoose.model('Booth', boothSchema);
const Question = mongoose.model('Question', questionSchema);

// Sample booth data
const sampleBooths = [
  {
    name: 'TechCorp Solutions',
    title: 'Innovation in Technology',
    description: '<h2>Welcome to TechCorp Solutions</h2><p>We are pioneers in cutting-edge technology solutions, specializing in AI, Machine Learning, and Cloud Computing. Our mission is to transform businesses through innovative digital solutions.</p><p>Visit us to explore the future of technology!</p>',
    metadata: {
      tag: 'Technology',
      contactInfo: {
        email: 'info@techcorp.com',
        phone: '+1-555-0101',
        website: 'https://techcorp.example.com'
      }
    },
    resources: [
      { label: 'Company Brochure', url: 'https://example.com/brochure.pdf', type: 'pdf' },
      { label: 'Product Demo', url: 'https://example.com/demo', type: 'link' }
    ]
  },
  {
    name: 'GreenEarth Initiatives',
    title: 'Sustainable Living Solutions',
    description: '<h2>GreenEarth Initiatives</h2><p>Leading the way in environmental sustainability and eco-friendly products. We believe in creating a greener tomorrow through innovative sustainable solutions.</p>',
    metadata: {
      tag: 'Environment',
      contactInfo: {
        email: 'contact@greenearth.org',
        phone: '+1-555-0102',
        website: 'https://greenearth.example.org'
      }
    }
  },
  {
    name: 'HealthPlus Medical',
    title: 'Advanced Healthcare Technology',
    description: '<h2>HealthPlus Medical</h2><p>Revolutionary healthcare solutions combining technology with compassionate care. Specializing in telemedicine, digital health records, and AI-powered diagnostics.</p>',
    metadata: {
      tag: 'Healthcare',
      contactInfo: {
        email: 'info@healthplus.com',
        phone: '+1-555-0103',
        website: 'https://healthplus.example.com'
      }
    }
  },
  {
    name: 'EduLearn Platform',
    title: 'Digital Education Revolution',
    description: '<h2>EduLearn Platform</h2><p>Transforming education through interactive digital learning experiences. We offer comprehensive online courses, virtual classrooms, and personalized learning paths.</p>',
    metadata: {
      tag: 'Education',
      contactInfo: {
        email: 'support@edulearn.com',
        phone: '+1-555-0104',
        website: 'https://edulearn.example.com'
      }
    }
  },
  {
    name: 'FinanceWise Solutions',
    title: 'Smart Financial Management',
    description: '<h2>FinanceWise Solutions</h2><p>Your partner in financial success. We provide cutting-edge fintech solutions, investment platforms, and financial advisory services.</p>',
    metadata: {
      tag: 'Finance',
      contactInfo: {
        email: 'hello@financewise.com',
        phone: '+1-555-0105',
        website: 'https://financewise.example.com'
      }
    }
  },
  {
    name: 'FoodHub Innovations',
    title: 'Future of Food Technology',
    description: '<h2>FoodHub Innovations</h2><p>Revolutionizing the food industry with innovative solutions in food delivery, restaurant management, and sustainable farming practices.</p>',
    metadata: {
      tag: 'Food & Beverage',
      contactInfo: {
        email: 'info@foodhub.com',
        phone: '+1-555-0106',
        website: 'https://foodhub.example.com'
      }
    }
  },
  {
    name: 'TravelEase Services',
    title: 'Smart Travel Solutions',
    description: '<h2>TravelEase Services</h2><p>Making travel seamless and enjoyable. We offer comprehensive travel planning, booking services, and destination management solutions.</p>',
    metadata: {
      tag: 'Travel & Tourism',
      contactInfo: {
        email: 'contact@travelease.com',
        phone: '+1-555-0107',
        website: 'https://travelease.example.com'
      }
    }
  },
  {
    name: 'RetailPro Systems',
    title: 'Modern Retail Management',
    description: '<h2>RetailPro Systems</h2><p>Empowering retailers with advanced POS systems, inventory management, and customer engagement tools for the digital age.</p>',
    metadata: {
      tag: 'Retail',
      contactInfo: {
        email: 'support@retailpro.com',
        phone: '+1-555-0108',
        website: 'https://retailpro.example.com'
      }
    }
  },
  {
    name: 'AutoDrive Technologies',
    title: 'Automotive Innovation',
    description: '<h2>AutoDrive Technologies</h2><p>Leading the automotive revolution with electric vehicles, autonomous driving systems, and smart mobility solutions.</p>',
    metadata: {
      tag: 'Automotive',
      contactInfo: {
        email: 'info@autodrive.com',
        phone: '+1-555-0109',
        website: 'https://autodrive.example.com'
      }
    }
  },
  {
    name: 'MediaStream Studios',
    title: 'Digital Media Production',
    description: '<h2>MediaStream Studios</h2><p>Creating compelling digital content and streaming solutions. Specializing in video production, live streaming, and content distribution.</p>',
    metadata: {
      tag: 'Media & Entertainment',
      contactInfo: {
        email: 'hello@mediastream.com',
        phone: '+1-555-0110',
        website: 'https://mediastream.example.com'
      }
    }
  }
];

// Function to create questions for a booth
const createQuestionsForBooth = (boothId, boothName, tag) => {
  const questions = [];
  
  // Easy question
  questions.push({
    booth: boothId,
    question: `What is the main focus of ${boothName}?`,
    options: [
      { text: tag, isCorrect: true },
      { text: 'Manufacturing', isCorrect: false },
      { text: 'Agriculture', isCorrect: false },
      { text: 'Construction', isCorrect: false }
    ],
    difficulty: 'easy',
    explanation: `${boothName} specializes in ${tag} solutions.`,
    points: 10
  });

  // Medium question
  questions.push({
    booth: boothId,
    question: `Which service does ${boothName} provide?`,
    options: [
      { text: 'Digital Solutions', isCorrect: true },
      { text: 'Physical Products Only', isCorrect: false },
      { text: 'Traditional Services', isCorrect: false },
      { text: 'None of the above', isCorrect: false }
    ],
    difficulty: 'medium',
    explanation: `${boothName} provides innovative digital solutions in their field.`,
    points: 10
  });

  // Hard question
  questions.push({
    booth: boothId,
    question: `What makes ${boothName} stand out in the industry?`,
    options: [
      { text: 'Innovation and Technology', isCorrect: true },
      { text: 'Low Prices', isCorrect: false },
      { text: 'Large Office Space', isCorrect: false },
      { text: 'Traditional Methods', isCorrect: false }
    ],
    difficulty: 'hard',
    explanation: `${boothName} stands out through their innovative approach and use of cutting-edge technology.`,
    points: 10
  });

  return questions;
};

async function createSampleData() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing booths and questions...');
    await Booth.deleteMany({});
    await Question.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Create booths
    console.log('🏢 Creating sample booths...');
    const createdBooths = await Booth.insertMany(sampleBooths);
    console.log(`✅ Created ${createdBooths.length} booths\n`);

    // Create questions for each booth
    console.log('📝 Creating sample questions...');
    let totalQuestions = 0;
    
    for (const booth of createdBooths) {
      const questions = createQuestionsForBooth(booth._id, booth.name, booth.metadata.tag);
      await Question.insertMany(questions);
      totalQuestions += questions.length;
      console.log(`   ✓ Created ${questions.length} questions for ${booth.name}`);
    }
    
    console.log(`\n✅ Created ${totalQuestions} total questions\n`);

    // Summary
    console.log('='.repeat(60));
    console.log('📊 SAMPLE DATA SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Booths Created: ${createdBooths.length}`);
    console.log(`Total Questions Created: ${totalQuestions}`);
    console.log(`Questions per Booth: 3 (Easy, Medium, Hard)`);
    console.log('='.repeat(60));
    console.log('\n✨ Sample data created successfully!');
    console.log('🎮 You can now test the quiz functionality');
    console.log('🔗 Visit: http://localhost:3000/quiz');
    console.log('='.repeat(60) + '\n');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
createSampleData();
