require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../src/models/User");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createSuperAdmin = async () => {
  const { MONGODB_URI, SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } =
    process.env;

  if (!MONGODB_URI) {
    throw new Error("Set MONGODB_URI in Backend/.env before creating the account.");
  }
  if (!SUPER_ADMIN_NAME || !SUPER_ADMIN_NAME.trim()) {
    throw new Error("Set SUPER_ADMIN_NAME in Backend/.env.");
  }
  if (
    !SUPER_ADMIN_EMAIL ||
    !EMAIL_PATTERN.test(SUPER_ADMIN_EMAIL.trim())
  ) {
    throw new Error("Set a valid SUPER_ADMIN_EMAIL in Backend/.env.");
  }
  if (!SUPER_ADMIN_PASSWORD || SUPER_ADMIN_PASSWORD.length < 12) {
    throw new Error(
      "Set SUPER_ADMIN_PASSWORD in Backend/.env to a password of at least 12 characters.",
    );
  }

  await mongoose.connect(MONGODB_URI);

  const existingSuperAdmin = await User.exists({ role: "super_admin" });
  if (existingSuperAdmin) {
    throw new Error(
      "A super-admin account already exists. Refusing to create another.",
    );
  }

  const email = SUPER_ADMIN_EMAIL.trim().toLowerCase();
  if (await User.exists({ email })) {
    throw new Error("That email is already in use by another account.");
  }

  const superAdmin = await User.create({
    name: SUPER_ADMIN_NAME.trim(),
    email,
    password: SUPER_ADMIN_PASSWORD,
    role: "super_admin",
    tenantId: null,
    status: "active",
  });

  console.log(`Super admin created for ${superAdmin.email}.`);
};

createSuperAdmin()
  .catch((error) => {
    console.error(`Unable to create super admin: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
