import dotenv from "dotenv";

dotenv.config();

const dbUrl = (process.env.DB_URL || "")
  .replace("DB_NAME", process.env.DB_NAME)
  .replace("DB_USERNAME", process.env.DB_USERNAME)
  .replace("DB_PASSWORD", process.env.DB_PASSWORD);

const config = {
  dbUrl,

  port: process.env.PORT,
  env: process.env.NODE_ENV,
  characters: process.env.CHARACTERS,

  appUrl: process.env.APP_URL,
  baseUrl: process.env.BASE_URL,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,

  mailer: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },

  awsS3: {
    bucket: process.env.AWS_BUCKET_NAME,
    region: process.env.AWS_BUCKET_REGION,
    accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_BUCKET_SECRET_KEY,
  },

  twilio: {
    authToken: process.env.TWILIO_AUTH_TOKEN,
    serviceSID: process.env.TWILIO_SERVICE_SID,
    accountSID: process.env.TWILIO_ACCOUNT_SID,
    messagingServiceSID: process.env.TWILIO_MESSAGING_SERVICE_SID,
  },

  apple: {
    scope: process.env.APPLE_SCOPE,
    key_id: process.env.APPLE_KEY_ID,
    team_id: process.env.APPLE_TEAM_ID,
    client_id: process.env.APPLE_CLIENT_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY,
  },

  stripe: {
    apiVersion: "2022-08-01",
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    subscriptionAmount: 50 * 100, // $50/month in cents
  },

  googleMapKey: process.env.GOOGLE_MAP_KEY,

  originWhitelist: [
    "http://localhost:3000",
    "https://dev.noshly.io",
    "https://noshly.vercel.app",
    "https://leafy-begonia-391368.netlify.app",
    "http://localhost:5173",
  ],

  popupColors: ['#357EC2','#318979','#CF5967','#8776CD','#D75E98'], 
  // old popupColors ["#8AF89C", "#61E3DB", "#8DDEFD", "#F59A94", "#ADB0FF", "#FFCEA0"],

  serveSafeStatus: ["Uploaded", "Approved", "Denied"],
  AlertSystemTypes: ["Critical", "Warning", "Success"],
  popupImagesTypes: ["chef", "food", "popup", "venue"],
  pronounsTypes: ["He/Him", "She/Her", "They/Them", "Other"],
  venueTypes: ["Takeover", "Private event", "Rented", "Owned by you"],
  tagsTypes: ["SEATING LOCATION", "SEATING TYPES", "DINING EXPERIENCE LEVEL"],
  journeyTypes: ["Certificate", "Job", "Education", "Training", "Popup", "Special event", "Private event"],
  chefRoles: ["head chef", "sous chef", "pastry chef", "server"],

  parkingOptions: [
    "Free onsite parking",
    "Free street parking",
    "Valet",
    "Paid onsite parking",
    "Metered street parking",
    "Parking lot or garage",
  ],

  onboardingStages: {
    1: "tell us about you chef name",
    2: "let’s talk numbers",
    3: "what have you been up to",
    4: "share your success stories",
    5: "create your own popup",
    6: "have a venue? If not, it’s ok",
    7: "time for pesky parking",
    8: "picture time",
    9: "add tags to your popup",
  },

  systemTags: [
    { type: "CUISINE TYPE", name: "American" },
    { type: "CUISINE TYPE", name: "Mexican" },
    { type: "CUISINE TYPE", name: "French" },
    { type: "CUISINE TYPE", name: "Korean" },
    { type: "CUISINE TYPE", name: "Greek" },
    { type: "CUISINE TYPE", name: "Italian" },
    { type: "SEATING LOCATION", name: "Fresco" },
    { type: "SEATING LOCATION", name: "Indoor" },
    { type: "SEATING LOCATION", name: "Pickup" },
    { type: "SEATING TYPES", name: "Multi-tables" },
    { type: "SEATING TYPES", name: "One big table" },
    { type: "SEATING TYPES", name: "Bar only" },
    { type: "DINING EXPERIENCE LEVEL", name: "Casual" },
    { type: "DINING EXPERIENCE LEVEL", name: "Casual fine dining" },
    { type: "DINING EXPERIENCE LEVEL", name: "Fine dining" },
    { type: "DINING EXPERIENCE LEVEL", name: "Drops" },
  ],

  systemTasks: [
    { title: "Verify your email." },
    { title: "Verify your phone number." },
    { title: "Connect your bank info to take payments." },
    { title: "Purchase Noshly Premium to Publish your Popup." },
    { title: "Complete your chef profile.", totalTasks: 4, completedTasks: 0 },
  ],

  systemPopupTasks: [
    { title: "Complete your menu." },
    { title: "Publish your popup." },
    { title: "Invite members to your team." },
    { title: "Upload your Serve safe certificate." },
    { title: "Complete your popup's profile.", totalTasks: 5, completedTasks: 0 },
  ],

  populate: {
    reservation: [{ path: "popupId", select: ["name"] }],
    menu: [{ path: "cuisineType", select: "name isHidden" }],
    member: [{ path: "acceptedBy", select: ["firstName", "lastName"] }],
    popupChef: [{ path: "chefId", select: ["aboutChef", "firstName", "lastName", "image"] }],
    popup: ["seatingLocation", "seatingTypes", "diningExperience"].map((path) => ({ path, select: "name" })),
    serveSafe: [{ path: "chefId", select: ["firstName", "lastName", "email"] }],
    task: [
      { path: "popupId", select: ["color"] },
      { path: "createdBy", select: ["firstName", "lastName"] },
      { path: "completedBy", select: ["firstName", "lastName"] },
      { path: "assignedChefId", select: ["firstName", "lastName"] },
    ],
  },
};

export default config;
