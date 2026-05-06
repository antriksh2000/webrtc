const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("../models/User");
const { connectToDatabase } = require("../server");

dotenv.config();

async function seedDemoUser() {
  const requiredVariables = ["MONGO_URI", "DEMO_NAME", "DEMO_EMAIL", "DEMO_PASSWORD"];
  const missingVariables = requiredVariables.filter((name) => !process.env[name]);

  if (missingVariables.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(", ")}`);
  }

  await connectToDatabase(process.env.MONGO_URI);

  const passwordHash = await bcrypt.hash(process.env.DEMO_PASSWORD, 10);

  await User.findOneAndUpdate(
    {
      email: process.env.DEMO_EMAIL.trim().toLowerCase(),
    },
    {
      name: process.env.DEMO_NAME,
      email: process.env.DEMO_EMAIL.trim().toLowerCase(),
      passwordHash,
    },
    {
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  console.log(`Demo user ready: ${process.env.DEMO_EMAIL}`);
  process.exit(0);
}

seedDemoUser().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

