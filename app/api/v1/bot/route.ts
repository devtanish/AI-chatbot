// ========================================
// FILE: app/api/chat/route.ts
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { OpenRouter } from "@openrouter/sdk";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// OpenRouter response types
interface ChatMessage {
  role: string;
  content: string | null;
}

interface ChatChoice {
  message?: ChatMessage;
  delta?: ChatMessage;
}

interface ChatResponse {
  choices: ChatChoice[];
}

// Initialize OpenRouter
const openRouter = new OpenRouter({
  apiKey: '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',
});

// PREDEFINED Q&A DATABASE
const PREDEFINED_QA = [
  { 
    question: "How can I purchase a course?", 
    answer: "Select the course, click 'Enroll Now', and complete payment through our secure payment gateway.",
    keywords: ["purchase", "buy", "enroll", "payment", "pay for"]
  },
  { 
    question: "Do you provide a certificate after completing a course?", 
    answer: "Yes, every course includes a verified certificate upon successful completion.",
    keywords: ["certificate", "certification", "credential", "completion"]
  },
  { 
    question: "Are your courses suitable for beginners?", 
    answer: "Yes, we offer beginner-to-advanced level courses with step-by-step guidance.",
    keywords: ["beginner", "starter", "new to", "learning level"]
  },
  { 
    question: "Can I access the courses on mobile?", 
    answer: "Yes, courses can be accessed from mobile, tablet, and desktop.",
    keywords: ["mobile", "phone", "tablet", "device", "android", "ios"]
  },
  { 
    question: "Do the courses include downloadable study materials?", 
    answer: "Yes, selected courses provide downloadable PDFs and notes.",
    keywords: ["download", "pdf", "materials", "notes", "resources"]
  },
  { 
    question: "Is there a time limit for completing the courses?", 
    answer: "Most courses offer lifetime access; however, exam-preparation batches may have a time limit.",
    keywords: ["time limit", "deadline", "duration", "lifetime", "access period"]
  },
  { 
    question: "Can I learn at my own pace?", 
    answer: "Yes, you can learn anytime at your own convenience with self-paced modules.",
    keywords: ["own pace", "self-paced", "flexible", "anytime"]
  },
  { 
    question: "What should I do if a video doesn't load?", 
    answer: "Clear cache, refresh the page, or contact support if the issue persists.",
    keywords: ["video", "loading", "not working", "playback", "stuck"]
  },
  { 
    question: "Can I switch to a different course after enrollment?", 
    answer: "Switching is allowed within 48 hours of purchase if the progress is below 10%.",
    keywords: ["switch", "change course", "different course", "swap"]
  },
  { 
    question: "Do you offer live interactive sessions?", 
    answer: "Yes, selected courses include weekly live mentor sessions.",
    keywords: ["live", "interactive", "mentor", "session", "webinar"]
  },
  { 
    question: "How do I find colleges based on my marks?", 
    answer: "Use the College Finder and enter your marks, stream, city, and budget to view matches.",
    keywords: ["college finder", "marks", "search college", "find college"]
  },
  { 
    question: "Which cities do you cover for college listings?", 
    answer: "We cover colleges and schools across India including metro and non-metro cities.",
    keywords: ["cities", "locations", "coverage", "area", "where"]
  },
  { 
    question: "Can I apply to colleges directly through your website?", 
    answer: "Yes, many colleges accept direct applications through our portal.",
    keywords: ["apply", "application", "admission", "direct apply"]
  },
  { 
    question: "Do you list both government and private institutions?", 
    answer: "Yes, we list government, private, and autonomous institutions with full details.",
    keywords: ["government", "private", "institution type", "college type"]
  },
  { 
    question: "How can I compare colleges?", 
    answer: "Use the Compare Colleges tool to compare rankings, fees, placements, and exams.",
    keywords: ["compare", "comparison", "versus", "vs", "difference"]
  },
  { 
    question: "Do you show placement records of colleges?", 
    answer: "Yes, each college profile includes placement stats, top recruiters, and salary ranges.",
    keywords: ["placement", "recruitment", "jobs", "companies", "salary"]
  },
  { 
    question: "How do I check admission deadlines?", 
    answer: "Visit any college page to view application deadlines and entrance exam timelines.",
    keywords: ["deadline", "last date", "admission date", "timeline"]
  },
  { 
    question: "Can I get personalized college recommendations?", 
    answer: "Yes, you can request personalized guidance from our admission experts.",
    keywords: ["recommendation", "suggest", "personalized", "guidance"]
  },
  { 
    question: "Do you guarantee college admission?", 
    answer: "No, we do not guarantee admission. We only assist with guidance and information.",
    keywords: ["guarantee", "assured", "confirm admission"]
  },
  { 
    question: "Is there an application fee for applying to colleges?", 
    answer: "Application fees vary by college and will be shown during the application process.",
    keywords: ["application fee", "fee", "cost", "charges"]
  },
  { 
    question: "How do I apply for scholarships?", 
    answer: "Go to Scholarships → choose the scholarship → follow the application steps given.",
    keywords: ["scholarship", "financial aid", "grant", "funding"]
  },
  { 
    question: "Are scholarships available for all students?", 
    answer: "Scholarship eligibility depends on academic performance, income, category, or talent.",
    keywords: ["eligibility", "who can apply", "criteria", "qualify"]
  },
  { 
    question: "Do you help with government scholarship applications?", 
    answer: "Yes, we provide information and step-by-step assistance for government scholarships.",
    keywords: ["government scholarship", "national scholarship", "state scholarship"]
  },
  { 
    question: "What is your refund policy?", 
    answer: "Refunds are available within 7 days if less than 20% content is completed.",
    keywords: ["refund", "money back", "return", "cancel"]
  },
  { 
    question: "How long does it take to receive a refund?", 
    answer: "Refunds are processed within 7–10 business days to the original payment method.",
    keywords: ["refund time", "how long", "processing time"]
  },
  { 
    question: "What payment methods are accepted?", 
    answer: "We support UPI, debit/credit cards, net banking, EMI, and wallets.",
    keywords: ["payment", "pay", "method", "upi", "card", "wallet"]
  },
  { 
    question: "Do you offer EMI or installment options?", 
    answer: "Yes, EMI options are available for selected courses above a certain amount.",
    keywords: ["emi", "installment", "monthly payment", "split payment"]
  },
  { 
    question: "How can I contact customer support?", 
    answer: "You can reach support via live chat, email, or helpline number available on the Contact page.",
    keywords: ["support", "help", "contact", "customer service", "assistance"]
  },
  { 
    question: "What are your business hours?", 
    answer: "Support is available Monday–Saturday from 9 AM to 8 PM.",
    keywords: ["hours", "timing", "when available", "working hours"]
  },
  { 
    question: "How do I reset my password?", 
    answer: "Go to Login → Forgot Password → enter your email to receive a reset link.",
    keywords: ["password", "reset", "forgot", "login issue"]
  },
  { 
    question: "Is my data safe?", 
    answer: "Yes, we follow encrypted and GDPR-compliant security standards.",
    keywords: ["security", "safe", "privacy", "data protection", "secure"]
  },
];

// DATABASE SCHEMA
const DB_SCHEMA = `
Tables:
1. User (id, name, email, createdAt, subscriptionType)
2. Order (id, userId, totalAmount, status, createdAt)
3. Product (id, name, price, category, stockCount)
4. Transaction (id, orderId, paymentMethod, amount, status)

Relationships:
- Order.userId -> User.id
- Transaction.orderId -> Order.id

Field Descriptions:
User: id (PK), name (full name), email (unique), subscriptionType (Premium/Basic), createdAt (timestamp)
Product: id (PK), name (title), price (float), category (classification), stockCount (integer)
Order: id (PK), totalAmount (float), status (Shipped/Completed), createdAt (timestamp), userId (FK to User)
Transaction: id (PK), paymentMethod (Credit Card/PayPal), amount (float), status (Success/Failed), orderId (FK to Order)

IMPORTANT SQL RULES:
- ONLY SELECT queries allowed
- Table/column names MUST use double quotes: "User", "name"
- String values MUST use single quotes: 'Premium'
- ALWAYS add LIMIT 10 for safety
`;

// Helper function
function extractContent(response: ChatResponse): string | null {
  return response?.choices?.[0]?.message?.content?.trim() ?? null;
}

// STEP 1: INTENT CLASSIFICATION (FIXED)
async function determineIntent(message: string): Promise<'predefined' | 'database' | 'general'> {
  try {
    const lowerMsg = message.toLowerCase().trim();
    
    // PRIORITY 1: Greetings and conversational patterns
    const greetingPatterns = [
      /^(hi|hello|hey|greetings|sup|wassup|yo)$/,
      /^(good morning|good afternoon|good evening)$/,
      /^(how are you|whats up|what's up|howdy)$/,
      /^(thanks|thank you|thx|ty)$/,
      /^(bye|goodbye|see you|cya|later)$/,
    ];
    
    const identityPatterns = [
      /who are you/,
      /what are you/,
      /what can you do/,
      /help me/,
      /introduce yourself/,
      /tell me about yourself/,
    ];
    
    // Check greeting patterns first
    if (greetingPatterns.some(pattern => pattern.test(lowerMsg)) || 
        identityPatterns.some(pattern => pattern.test(lowerMsg))) {
      console.log('→ Matched greeting/identity pattern');
      return 'general';
    }
    
    // PRIORITY 2: Explicit database queries
    const dbKeywords = ['show', 'list', 'fetch', 'get', 'display', 'select', 'query', 'find all', 'retrieve'];
    const dataKeywords = ['users', 'orders', 'products', 'transactions', 'data', 'records', 'entries', 'database'];
    
    const hasDbKeyword = dbKeywords.some(k => lowerMsg.includes(k));
    const hasDataKeyword = dataKeywords.some(k => lowerMsg.includes(k));
    
    // Only classify as database if BOTH keywords present AND question is data-focused
    if (hasDbKeyword && hasDataKeyword && lowerMsg.length > 10) {
      return 'database';
    }
    
    // PRIORITY 3: Use AI for ambiguous cases
    const completion = await openRouter.chat.send({
      model: "google/gemma-3-27b-it:free",
      messages: [
        {
          role: "system",
          content: `You are an intent classifier. Classify user messages into exactly ONE category:

**GENERAL** - Use for:
- Greetings: "hi", "hello", "hey", "good morning"
- Identity questions: "who are you", "what are you", "what can you do"
- Casual conversation: "how are you", "thanks", "goodbye"
- Small talk or chitchat
- Off-topic questions

**PREDEFINED** - Use ONLY for specific educational platform questions about:
- Courses, certificates, learning materials, course access
- Colleges, admissions, applications, college finder
- Scholarships, financial aid, eligibility
- Payments, refunds, EMI, pricing
- Platform features, technical issues
- Policies and guidelines

**DATABASE** - Use ONLY for explicit data retrieval requests:
- "show all users", "list my orders", "get user data"
- "find products", "display transactions", "query database"
- Must mention data/records/users/orders/products explicitly

CRITICAL RULES:
1. If unsure, choose GENERAL (default to conversation)
2. Only choose DATABASE if explicitly asking for data retrieval
3. Only choose PREDEFINED if asking about platform features

Respond with ONLY ONE WORD: general, predefined, or database`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.3,
    }) as ChatResponse;

    const intent = extractContent(completion)?.toLowerCase().trim();
    console.log('→ AI classified as:', intent);
    
    // Validate and default to general
    if (intent === 'predefined' || intent === 'database' || intent === 'general') {
      return intent;
    }
    
    console.log('Invalid AI response, defaulting to general');
    return 'general';
    
  } catch (error) {
    console.error('Intent classification error:', error);
    return 'general'; // Always default to general on error
  }
}

// STEP 2: PREDEFINED Q&A HANDLER
async function handlePredefined(message: string): Promise<string | null> {
  try {
    // Fast keyword matching first
    const lowerMessage = message.toLowerCase();
    const candidates: typeof PREDEFINED_QA = [];
    
    for (const qa of PREDEFINED_QA) {
      const hasKeyword = qa.keywords.some(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword) {
        candidates.push(qa);
      }
    }
    
    // If no keyword matches, try AI matching
    if (candidates.length === 0) {
      const completion = await openRouter.chat.send({
        model: "google/gemma-3-27b-it:free",
        messages: [
          {
            role: "system",
            content: `Match the user question to ONE predefined question. Return ONLY the matching question text or "NO_MATCH".

Predefined questions:
${PREDEFINED_QA.map((qa) => `- ${qa.question}`).join("\n")}`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }) as ChatResponse;

      const response = extractContent(completion);
      
      if (!response || response === "NO_MATCH") {
        return null;
      }

      const match = PREDEFINED_QA.find(
        (qa) => qa.question.toLowerCase() === response.toLowerCase()
      );

      return match?.answer ?? null;
    }
    
    // If multiple keyword matches, use AI to pick best one
    if (candidates.length > 1) {
      const completion = await openRouter.chat.send({
        model: "google/gemma-3-27b-it:free",
        messages: [
          {
            role: "system",
            content: `Select the BEST matching question or return "NO_MATCH".

Candidates:
${candidates.map((qa) => `- ${qa.question}`).join("\n")}`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }) as ChatResponse;

      const response = extractContent(completion);
      
      if (!response || response === "NO_MATCH") {
        return candidates[0].answer;
      }

      const match = candidates.find(
        (qa) => qa.question.toLowerCase() === response.toLowerCase()
      );

      return match?.answer ?? candidates[0].answer;
    }
    
    // Single keyword match - return directly
    return candidates[0].answer;
    
  } catch (error) {
    console.error('Predefined Q&A error:', error);
    return null;
  }
}

// STEP 3: DATABASE QUERY HANDLER
async function handleDatabase(message: string): Promise<string | null> {
  try {
    // Generate SQL
    const completion = await openRouter.chat.send({
      model: "google/gemma-3-27b-it:free",
      messages: [
        {
          role: "system",
          content: `You are a SQL generator. Generate SAFE SELECT queries only.

${DB_SCHEMA}

Return ONLY the SQL query or "CANNOT_QUERY" if impossible.

Example:
User: "Show all premium users"
Response: SELECT "id", "name", "email" FROM "User" WHERE "subscriptionType" = 'Premium' LIMIT 10`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    }) as ChatResponse;

    const rawSQL = extractContent(completion);
    
    if (!rawSQL || rawSQL === "CANNOT_QUERY") {
      return null;
    }

    // Clean SQL
    const sql = rawSQL
      .replace(/```sql/g, '')
      .replace(/```/g, '')
      .replace(/\n/g, ' ')
      .replace(/sql/gi, '')
      .trim();

    console.log('Generated SQL:', sql);

    // Safety check
    if (!sql.toLowerCase().startsWith('select')) {
      console.error('Non-SELECT query rejected:', sql);
      return null;
    }

    // Execute query
    const results = await prisma.$queryRawUnsafe(sql);
    const dataArray = Array.isArray(results) ? results : [results];

    console.log('Query results:', dataArray.length, 'rows');

    // Generate response
    const responseCompletion = await openRouter.chat.send({
      model: "google/gemma-3-27b-it:free",
      messages: [
        {
          role: "system",
          content: `Convert database results into a clear, conversational response. Be concise. If empty, say "No results found."`,
        },
        {
          role: "user",
          content: `Question: ${message}\n\nData: ${JSON.stringify(dataArray, null, 2)}`,
        },
      ],
    }) as ChatResponse;

    return extractContent(responseCompletion) || 'No results found.';

  } catch (error) {
    console.error('Database query error:', error);
    return null;
  }
}

// STEP 4: GENERAL AI HANDLER (IMPROVED)
async function handleGeneral(message: string): Promise<string> {
  try {
    const completion = await openRouter.chat.send({
      model: "google/gemma-3-27b-it:free",
      messages: [
        {
          role: "system",
          content: `You are EduBot, a friendly educational platform assistant. 

Your role:
- Help students find courses, colleges, and scholarships
- Answer questions about platform features and policies
- Provide guidance on admissions and career planning
- Be warm, helpful, and conversational

Respond naturally to:
- Greetings (hi, hello, hey) → Greet warmly and offer help
- Identity questions (who are you, what can you do) → Introduce yourself briefly
- Gratitude (thanks, thank you) → Acknowledge kindly
- Goodbyes (bye, see you) → Wish them well
- General conversation → Be friendly and helpful

Keep responses concise (2-4 sentences). Always sound human and approachable.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
    }) as ChatResponse;

    const response = extractContent(completion);
    
    if (!response) {
      // Enhanced fallbacks
      const lowerMsg = message.toLowerCase();
      
      if (lowerMsg.match(/^(hi|hello|hey|greetings|sup)$/)) {
        return "Hello! 👋 I'm EduBot, your educational assistant. I can help you with courses, colleges, scholarships, and more. What would you like to know?";
      }
      if (lowerMsg.includes('who are you') || lowerMsg.includes('what are you')) {
        return "I'm EduBot, your friendly educational platform assistant! I help students find courses, explore colleges, apply for scholarships, and navigate our platform. How can I assist you today?";
      }
      if (lowerMsg.includes('what can you do') || lowerMsg.includes('help me')) {
        return "I can help you with:\n• Finding and enrolling in courses\n• Discovering colleges and admission info\n• Applying for scholarships\n• Platform features and policies\n\nWhat would you like to explore?";
      }
      if (lowerMsg.match(/^(thanks|thank you|thx|ty)$/)) {
        return "You're very welcome! 😊 Feel free to ask if you need anything else.";
      }
      if (lowerMsg.match(/^(bye|goodbye|see you|cya)$/)) {
        return "Goodbye! Have a great day! 👋 Come back anytime you need help.";
      }
      if (lowerMsg.includes('how are you')) {
        return "I'm doing great, thanks for asking! 😊 I'm here and ready to help you with any educational queries. What can I do for you?";
      }
      
      return "I'm here to help! I can assist you with courses, colleges, scholarships, and platform information. What would you like to know?";
    }
    
    return response;
    
  } catch (error) {
    console.error('General AI error:', error);
    
    // Robust fallbacks
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.match(/^(hi|hello|hey)$/)) {
      return "Hello! 👋 I'm here to help you with courses, colleges, and scholarships. What can I do for you?";
    }
    if (lowerMsg.includes('who are you')) {
      return "I'm EduBot, your educational platform assistant! I help students find the right courses, colleges, and scholarships. Ask me anything!";
    }
    
    return "I'm experiencing a temporary issue, but I'm here to help! Could you please rephrase your question?";
  }
}

// ========================================
// MAIN HANDLER
// ========================================
export async function GET(request: NextRequest) {
  const message = request.nextUrl.searchParams.get("message");

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    console.log('\n=== New Query ===');
    console.log('User:', message);

    // Step 1: Classify intent
    const intent = await determineIntent(message);
    console.log('Intent:', intent);

    let response: string | null = null;
    let source: string = '';

    // Step 2: Route to appropriate handler with fallback chain
    if (intent === 'predefined') {
      response = await handlePredefined(message);
      if (response) {
        source = 'predefined';
        console.log('Source: Predefined Q&A');
      } else {
        console.log('No predefined match, trying general AI...');
        response = await handleGeneral(message);
        source = 'general_fallback';
      }
    } 
    else if (intent === 'database') {
      response = await handleDatabase(message);
      if (response) {
        source = 'database';
        console.log('Source: Database Query');
      } else {
        console.log('Database query failed, trying general AI...');
        response = await handleGeneral(message);
        source = 'general_fallback';
      }
    } 
    else {
      response = await handleGeneral(message);
      source = 'general';
      console.log('Source: General AI');
    }

    console.log('Response:', response?.substring(0, 100) + '...');
    console.log('=================\n');

    return NextResponse.json({
      message: response,
      source,
      intent,
    });

  } catch (error: unknown) {
    console.error("Chatbot error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      {
        error: "Something went wrong processing your request.",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

// POST handler for standard REST API usage
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const url = new URL(request.url);
    url.searchParams.set('message', message);
    const mockRequest = new NextRequest(url);
    
    return await GET(mockRequest);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}