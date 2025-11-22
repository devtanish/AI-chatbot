import { NextRequest, NextResponse } from "next/server";
import { OpenRouter } from "@openrouter/sdk";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// Define response type based on OpenRouter's actual response structure
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

// Your predefined Q&A pairs
const PREDEFINED_QA = [
  { question: "How can I purchase a course?", answer: "Select the course, click 'Enroll Now', and complete payment through our secure payment gateway." },
  { question: "Do you provide a certificate after completing a course?", answer: "Yes, every course includes a verified certificate upon successful completion." },
  { question: "Are your courses suitable for beginners?", answer: "Yes, we offer beginner-to-advanced level courses with step-by-step guidance." },
  { question: "Can I access the courses on mobile?", answer: "Yes, courses can be accessed from mobile, tablet, and desktop." },
  { question: "Do the courses include downloadable study materials?", answer: "Yes, selected courses provide downloadable PDFs and notes." },
  { question: "Is there a time limit for completing the courses?", answer: "Most courses offer lifetime access; however, exam-preparation batches may have a time limit." },
  { question: "Can I learn at my own pace?", answer: "Yes, you can learn anytime at your own convenience with self-paced modules." },
  { question: "What should I do if a video doesn't load?", answer: "Clear cache, refresh the page, or contact support if the issue persists." },
  { question: "Can I switch to a different course after enrollment?", answer: "Switching is allowed within 48 hours of purchase if the progress is below 10%." },
  { question: "Do you offer live interactive sessions?", answer: "Yes, selected courses include weekly live mentor sessions." },
  { question: "How do I find colleges based on my marks?", answer: "Use the College Finder and enter your marks, stream, city, and budget to view matches." },
  { question: "Which cities do you cover for college listings?", answer: "We cover colleges and schools across India including metro and non-metro cities." },
  { question: "Can I apply to colleges directly through your website?", answer: "Yes, many colleges accept direct applications through our portal." },
  { question: "Do you list both government and private institutions?", answer: "Yes, we list government, private, and autonomous institutions with full details." },
  { question: "How can I compare colleges?", answer: "Use the Compare Colleges tool to compare rankings, fees, placements, and exams." },
  { question: "Do you show placement records of colleges?", answer: "Yes, each college profile includes placement stats, top recruiters, and salary ranges." },
  { question: "How do I check admission deadlines?", answer: "Visit any college page to view application deadlines and entrance exam timelines." },
  { question: "Can I get personalized college recommendations?", answer: "Yes, you can request personalized guidance from our admission experts." },
  { question: "Do you guarantee college admission?", answer: "No, we do not guarantee admission. We only assist with guidance and information." },
  { question: "Is there an application fee for applying to colleges?", answer: "Application fees vary by college and will be shown during the application process." },
  { question: "How do I apply for scholarships?", answer: "Go to Scholarships → choose the scholarship → follow the application steps given." },
  { question: "Are scholarships available for all students?", answer: "Scholarship eligibility depends on academic performance, income, category, or talent." },
  { question: "Do you help with government scholarship applications?", answer: "Yes, we provide information and step-by-step assistance for government scholarships." },
  { question: "Do you offer merit-based scholarships?", answer: "Yes, many scholarships on our site are purely merit-based." },
  { question: "Are scholarships provided by your website?", answer: "We publish scholarships from government and private organizations; we don't fund them." },
  { question: "How do I know if I'm eligible for a scholarship?", answer: "Each scholarship page includes complete eligibility details and required documents." },
  { question: "Is there a fee for applying to scholarships?", answer: "Most scholarships are free to apply; if there are charges, they are mentioned clearly." },
  { question: "Can international students apply for these scholarships?", answer: "Eligibility varies per scholarship — check the details on the scholarship page." },
  { question: "Do scholarships cover full tuition?", answer: "Some provide full coverage while others partially cover fees, books, hostel, or living costs." },
  { question: "How long does it take to receive scholarship results?", answer: "It depends on the organization offering the scholarship — usually 30–90 days." },
  { question: "What payment methods are accepted?", answer: "We support UPI, debit/credit cards, net banking, EMI, and wallets." },
  { question: "Do you offer EMI or installment options?", answer: "Yes, EMI options are available for selected courses above a certain amount." },
  { question: "Is GST included in the course price?", answer: "Yes, all listed prices are inclusive of taxes unless specified otherwise." },
  { question: "What is your refund policy?", answer: "Refunds are available within 7 days if less than 20% content is completed." },
  { question: "How long does it take to receive a refund?", answer: "Refunds are processed within 7–10 business days to the original payment method." },
  { question: "Can I get a refund after completing a course?", answer: "Refunds are not applicable after course completion." },
  { question: "What if my payment fails?", answer: "If money is deducted, it will be auto-refunded within 3–7 days; otherwise try again." },
  { question: "Why is my coupon code not working?", answer: "Coupons may expire or have usage limits; verify the terms before applying." },
  { question: "Do you offer bulk discounts?", answer: "Yes, institutions and groups can request customized pricing." },
  { question: "Are there free trial classes?", answer: "Yes, selected courses offer free demo videos before purchase." },
  { question: "How can I contact customer support?", answer: "You can reach support via live chat, email, or helpline number available on the Contact page." },
  { question: "What are your business hours?", answer: "Support is available Monday–Saturday from 9 AM to 8 PM." },
  { question: "Do you provide call support?", answer: "Yes, call support is available during working hours." },
  { question: "Can I track the status of my college application?", answer: "Yes, login to your dashboard to view your application status." },
  { question: "Can I request a callback from the team?", answer: "Yes, click the 'Request Callback' button on our support page." },
  { question: "Do you support regional languages?", answer: "Yes, support is available in English and Hindi." },
  { question: "Do you provide career counseling?", answer: "Yes, career counseling sessions can be booked from the Mentorship section." },
  { question: "Is there 24/7 support available?", answer: "Email support is available 24/7; phone support follows working hours." },
  { question: "Can I report incorrect information on the site?", answer: "Yes, use the 'Report Info' button on any page to submit corrections." },
  { question: "Do you support visually impaired or disabled users?", answer: "Yes, we provide accessibility support and special guidance on request." },
  { question: "How do I reset my password?", answer: "Go to Login → Forgot Password → enter your email to receive a reset link." },
  { question: "How do I update my profile details?", answer: "Login → Profile Settings → Edit and Save changes." },
  { question: "How do I change my registered mobile number?", answer: "Go to Profile → Verify identity → Update mobile number." },
  { question: "How do I delete my account?", answer: "Send an email to support with your registered mobile/email to request account deletion." },
  { question: "Can I have multiple accounts?", answer: "Multiple accounts are not permitted; duplicates may be blocked." },
  { question: "Why am I not receiving verification OTP?", answer: "Check spam SMS, resend OTP, or contact support if issue persists." },
  { question: "How do I enable notifications?", answer: "Go to Settings → Notifications → enable alerts for updates." },
  { question: "Can I download an invoice for my payment?", answer: "Yes, invoices are available under Orders in your dashboard." },
  { question: "Can parents create accounts for children?", answer: "Yes, parents can create accounts for school/college-going children." },
  { question: "Is my data safe?", answer: "Yes, we follow encrypted and GDPR-compliant security standards." },
  { question: "Do you provide internship opportunities?", answer: "Yes, selected career-oriented courses include internship opportunities." },
  { question: "Do you help with resume building?", answer: "Yes, resume templates and mentor guidance are included in placement-focused courses." },
  { question: "Do you provide job placement assistance?", answer: "Some premium courses include placement support through hiring partners." },
  { question: "Are interview preparation resources available?", answer: "Yes, we provide mock interviews, communication training, and aptitude tests." },
  { question: "Can I upload my resume for hiring opportunities?", answer: "Yes, students can upload resumes for job matching after eligible courses." },
  { question: "Are company connections genuine?", answer: "Yes, we partner only with verified and reputed organizations." },
  { question: "Do you have programs for school students?", answer: "Yes, we offer coding, communication, Olympiad prep, and career awareness courses for school students." },
  { question: "Do you provide entrance exam training?", answer: "Yes, we offer training for JEE, NEET, CUET, CAT, UPSC, and more." },
  { question: "Do you provide online tuition classes?", answer: "Yes, we provide Class 1–12 online tuition for CBSE, ICSE, and state boards." },
  { question: "Can teachers collaborate with your platform?", answer: "Yes, qualified teachers can apply to become course creators or curriculum partners." },
  { question: "Can institutes list their courses on your website?", answer: "Yes, educational institutions can partner with us by submitting onboarding details." },
  { question: "Do you organize workshops and webinars?", answer: "Yes, we conduct free and paid workshops every month." },
  { question: "How can I receive updates about new colleges and courses?", answer: "Subscribe to our newsletter to receive regular updates and alerts." },
  { question: "Do you have an Android app?", answer: "Yes, our mobile app is available on the Play Store to access all services." },
  { question: "Do you have an iOS app?", answer: "The iOS version is under development and will be launched soon." },
  { question: "Can I share my course progress on LinkedIn?", answer: "Yes, you can share certificates and course milestones directly to LinkedIn." }
];

// Your database schema for AI to understand
const DB_SCHEMA = `
Tables:
1. User (id, name, email, createdAt, subscriptionType)
2. Order (id, userId, totalAmount, status, createdAt)
3. Product (id, name, price, category, stockCount)
4. Transaction (id, orderId, paymentMethod, amount, status)

Relationships:
- Order.userId -> User.id
- Transaction.orderId -> Order.id

// --- FIELD DESCRIPTION: WHAT EACH FIELD HOLDS ---
// 1. User Table:
// id: Primary Key, unique user identifier.
// name: User's full name.
// email: User's unique email address.
// subscriptionType: User's service tier (e.g., 'Premium', 'Basic').
// createdAt: Timestamp of account creation.

// 2. Product Table:
// id: Primary Key, unique product identifier.
// name: Product's official title.
// price: Selling price of the product (Float).
// category: Product classification (e.g., 'Electronics').
// stockCount: Current inventory quantity (Integer).

// 3. Order Table:
// id: Primary Key, unique purchase ID.
// totalAmount: Final monetary amount of the order (Float).
// status: Fulfillment stage (e.g., 'Shipped', 'Completed').
// createdAt: Timestamp the order was placed.
// userId: Foreign Key linking to User.id (who placed the order).

// 4. Transaction Table:
// id: Primary Key, unique payment record ID.
// paymentMethod: How the payment was processed (e.g., 'Credit Card', 'PayPal').
// amount: Monetary value of this specific payment (Float).
// status: Result of the payment (e.g., 'Success', 'Failed').
// orderId: Foreign Key linking to Order.id (which purchase it covers).


`;

// Initialize OpenRouter client - USE ENVIRONMENT VARIABLE!
const openRouter = new OpenRouter({
  apiKey: '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',
});

// Helper function to extract content from OpenRouter response
function extractContent(response: ChatResponse): string | null {
  return response?.choices?.[0]?.message?.content?.trim() ?? null;
}

// Step 1: Check if question matches predefined Q&A
async function findPredefinedAnswer(userMessage: string): Promise<string | null> {
  const completion = await openRouter.chat.send({
    model: "google/gemma-3-27b-it:free",
    messages: [
      {
        role: "system",
        content: `You are a question matcher. Given a user question and a list of predefined Q&A pairs, determine if the user's question matches any predefined question.

        If there's a match (even if worded differently), respond with ONLY the exact matching question text.
        If no match, respond with exactly: NO_MATCH

        Predefined questions:
        ${PREDEFINED_QA.map((qa) => `- ${qa.question}`).join("\n")}`,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  }) as ChatResponse;

  const response = extractContent(completion);

  if (!response || response === "NO_MATCH") return null;

  const match = PREDEFINED_QA.find(
    (qa) => qa.question.toLowerCase() === response.toLowerCase()
  );

  return match?.answer ?? null;
}

// Step 2: Generate SQL query from natural language
async function generateSQLQuery(userMessage: string): Promise<string | null> {
  const completion = await openRouter.chat.send({
    model: "google/gemma-3-27b-it:free",
    messages: [
      {
        role: "system",
        content: `You are a SQL query generator. Given a database schema and a user question, generate a safe SELECT query to fetch the required data.

        Database Schema:
        ${DB_SCHEMA}

        Rules:
        1. ONLY generate SELECT queries (no INSERT, UPDATE, DELETE)
        2. Always use parameterized placeholders like $1, $2 for user inputs
        3. Table and Column names (Identifiers) MUST be enclosed in double quotes (") to maintain case sensitivity.
        4. String values MUST be enclosed in single quotes (').
        5. Return ONLY the SQL query, nothing else
        6. If the question cannot be answered with the schema, respond with: CANNOT_QUERY

        FORMAT AND EXAMPLE QUERIES:
        **Template Structure:**
        SELECT <"Columns"> FROM "<Table>" WHERE "<ConditionColumn>" = $1;

        1.  **Fetch a user's ID and name based on their email:**
            SELECT id, "name" FROM "User" WHERE "email" = $1;

        2.  **Get the total amount of all orders with a specific status:**
            SELECT SUM("totalAmount") FROM "Order" WHERE "status" = $1;

        3.  **List product names that are in a specific category and cost less than a given price:**
            SELECT "name" FROM "Product" WHERE "category" = $1 AND "price" < $2;

        4.  **Retrieve the payment method and amount for all transactions linked to a specific order ID:**
            SELECT "paymentMethod", amount FROM "Transaction" WHERE "orderId" = $1;

        5.  **Find the names of users who have 'Premium' subscription (using static string value):**
            SELECT "name" FROM "User" WHERE "subscriptionType" = 'Premium';
        `,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  }) as ChatResponse;

  
  const query = extractContent(completion);
  const realQuery = query?.replace(/\n/g, " ").replaceAll("`", "").replaceAll("sql", "")?.trim();
  console.log("\n\n\n-\n" + realQuery + "\n-\n\n\n\n");

  if (!realQuery || realQuery === "CANNOT_QUERY" || !realQuery.toLowerCase().startsWith("select")) {
    return null;
  }

  return realQuery;
}

// Step 3: Execute query and get results (implement your DB connection)
async function executeQuery(sql: string): Promise<unknown[]> {
  try {
    // Use Prisma's $queryRawUnsafe for dynamic SQL queries
    const results = await prisma.$queryRawUnsafe(sql);
    
    // Ensure we always return an array
    if (Array.isArray(results)) {
      return results;
    }
    
    return [results];
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Step 4: Generate natural language response from data
async function generateResponse(userMessage: string, data: unknown[]): Promise<string> {
  const completion = await openRouter.chat.send({
    model: "google/gemma-3-27b-it:free",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant. Given the user's question and data from the database, provide a clear, conversational response.

        Be concise but informative. If the data is empty, politely say no results were found.`,
      },
      {
        role: "user",
        content: `Question: ${userMessage}\n\nData: ${JSON.stringify(data, null, 2)}`,
      },
    ],
  }) as ChatResponse;

  return extractContent(completion) ?? "I couldn't generate a response.";
}

// Main handler
export async function GET(request: NextRequest) {
  const message = request.nextUrl.searchParams.get("message");

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    // Step 1: Check predefined Q&A
    console.log("Checking predefined answers...");
    const predefinedAnswer = await findPredefinedAnswer(message);

    if (predefinedAnswer) {
      console.log("Found predefined answer");
      return NextResponse.json({
        message: predefinedAnswer,
        source: "predefined",
      });
    }

    // Step 2: Generate SQL query
    console.log("Generating SQL query...");
    const sqlQuery = await generateSQLQuery(message);

    if (!sqlQuery) {
      return NextResponse.json({
        message: "I'm sorry, I couldn't understand your question or find relevant data.",
        source: "error",
      });
    }

    // Step 3: Execute query
    console.log("Executing query:", sqlQuery);
    const data = await executeQuery(sqlQuery);

    // Step 4: Generate response
    console.log("Generating response...");
    const response = await generateResponse(message, data);

    return NextResponse.json({
      message: response,
      source: "database",
      debug: { sqlQuery, rowCount: data.length },
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