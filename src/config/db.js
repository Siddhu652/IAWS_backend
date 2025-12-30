const { PrismaClient } = require("../generated/prisma")
const IAWS_DB = new PrismaClient();
module.exports = IAWS_DB;
