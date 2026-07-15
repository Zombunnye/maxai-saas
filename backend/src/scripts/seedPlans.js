// ─── СЪЗДАВА 3-те начални плана в MongoDB ───
// Изпълни ЕДНОКРАТНО с: node src/scripts/seedPlans.js
// Ако план с този key вече съществува — пропуска го (безопасно за повторно пускане).

require("dotenv").config();
const mongoose = require("mongoose");
const Plan = require("../models/Plan");

const DEFAULT_PLANS = [
  {
    key: "free",
    name: "Starter",
    description: "Perfect for trying it out",
    prices: { gbp: 0, eur: 0, usd: 0 },
    limits: {
      chatbots: 1,
      conversationsPerMonth: 100,
      removeBranding: false,
      whiteLabel: false,
      apiAccess: false,
    },
    sortOrder: 1,
    isFeatured: false,
  },
  {
    key: "pro",
    name: "Pro",
    description: "For growing businesses",
    prices: { gbp: 49, eur: 59, usd: 59 },
    limits: {
      chatbots: 3,
      conversationsPerMonth: 2000,
      removeBranding: true,
      whiteLabel: false,
      apiAccess: false,
    },
    sortOrder: 2,
    isFeatured: true,
  },
  {
    key: "agency",
    name: "Agency",
    description: "Sell to your own clients",
    prices: { gbp: 149, eur: 179, usd: 179 },
    limits: {
      chatbots: -1,           // -1 = unlimited
      conversationsPerMonth: -1,
      removeBranding: true,
      whiteLabel: true,
      apiAccess: true,
    },
    sortOrder: 3,
    isFeatured: false,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const p of DEFAULT_PLANS) {
    const exists = await Plan.findOne({ key: p.key });
    if (exists) {
      console.log(`⏭️  Plan "${p.key}" already exists — skipped`);
    } else {
      await Plan.create(p);
      console.log(`✅ Plan "${p.key}" created (£${p.prices.gbp}/mo)`);
    }
  }

  await mongoose.disconnect();
  console.log("\n🎉 Done! Plans are now in the database.");
}

seed();
