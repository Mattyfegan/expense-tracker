import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../src/index.js";

/**
 * Minimal seed: creates a single admin user.
 * Used standalone in production initial setup (SEED_PROFILE=minimal).
 * Also called by seedDev to avoid duplication.
 *
 * Required env vars:
 *   ADMIN_PASSWORD - min 12 characters, auto-generates if missing (generate: openssl rand -base64 24)
 * Optional env vars:
 *   ADMIN_EMAIL    - defaults to admin@example.com
 *   ADMIN_NAME     - defaults to Admin
 */
async function seedMinimal(prisma) {
	const seedProfile = process.env.SEED_PROFILE || "dev";
	const adminEmail = process.env.ADMIN_EMAIL;
	let adminPassword = process.env.ADMIN_PASSWORD;
	const adminName = process.env.ADMIN_NAME || "Admin";

	if (!adminPassword) {
		const generated = randomBytes(24).toString("base64url");
		console.log(
			"⚠️  ADMIN_PASSWORD not set — auto-generated a random password.\n" +
				"  Save it if you need to log in as admin.",
		);
		adminPassword = generated;
	}
	if (adminPassword.length < 12) {
		throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
	}

	if (!adminEmail && seedProfile === "minimal") {
		throw new Error(
			"ADMIN_EMAIL is required when SEED_PROFILE=minimal.\n" +
				"  Set it in your environment to the real admin email address.",
		);
	}

	const resolvedEmail = adminEmail || "admin@example.com";

	const existing = await prisma.user.findUnique({
		where: { email: resolvedEmail },
	});

	if (existing) {
		console.log("✓ Admin user already exists");
		return null;
	}

	const admin = await prisma.user.create({
		data: {
			email: resolvedEmail,
			name: adminName,
			role: "admin",
			password: await bcrypt.hash(adminPassword, 12),
		},
	});

	console.log(`✓ Created admin user: ${admin.email}`);
	return admin;
}

/**
 * Development seed: admin user + representative sample data for local testing.
 * Runs by default (SEED_PROFILE=dev).
 */
async function seedDev(prisma) {
	const admin = await seedMinimal(prisma);

	if (admin) {
		const sampleUser = await prisma.user.create({
			data: {
				email: "user@example.com",
				name: "Sample User",
				role: "viewer",
				image:
					"https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
			},
		});

		console.log(`✓ Created sample user: ${sampleUser.email}`);

		await prisma.auditLog.create({
			data: {
				userId: admin.id,
				action: "CREATE",
				entity: "User",
				entityId: sampleUser.id,
				metadata: { email: sampleUser.email, role: sampleUser.role },
			},
		});

		console.log("✓ Created sample audit log");

		await prisma.job.create({
			data: {
				queue: "default",
				name: "example-job",
				status: "COMPLETED",
				data: { message: "This is a sample job" },
				completedAt: new Date(),
			},
		});

		console.log("✓ Created sample job");
	}

	await seedExpenseData(prisma);
}

const SEED_CATEGORIES = [
	{
		name: "Food & Dining",
		description: "Groceries, restaurants, and dining out",
	},
	{
		name: "Transport",
		description: "Fuel, public transit, rideshares, and parking",
	},
	{ name: "Housing", description: "Rent, mortgage, and home insurance" },
	{ name: "Utilities", description: "Electricity, internet, water, and phone" },
	{
		name: "Entertainment",
		description: "Movies, concerts, games, and streaming",
	},
	{ name: "Shopping", description: "Clothing, electronics, and home goods" },
	{ name: "Health", description: "Pharmacy, doctor visits, and fitness" },
	{ name: "Travel", description: "Flights, hotels, and car rentals" },
	{ name: "Subscriptions", description: "Recurring monthly services" },
];

const RECURRING_EXPENSES = [
	{ description: "Rent", category: "Housing", amount: 1200 },
	{ description: "Electricity bill", category: "Utilities", amount: 85 },
	{ description: "Internet", category: "Utilities", amount: 60 },
	{ description: "Phone bill", category: "Utilities", amount: 45 },
	{ description: "Netflix", category: "Subscriptions", amount: 15 },
	{ description: "Spotify", category: "Subscriptions", amount: 10 },
	{ description: "Gym membership", category: "Health", amount: 40 },
];

const DISCRETIONARY_EXPENSES = [
	{ description: "Groceries", category: "Food & Dining", min: 40, max: 120 },
	{
		description: "Restaurant dinner",
		category: "Food & Dining",
		min: 30,
		max: 90,
	},
	{ description: "Coffee", category: "Food & Dining", min: 4, max: 12 },
	{ description: "Lunch", category: "Food & Dining", min: 10, max: 25 },
	{ description: "Takeaway", category: "Food & Dining", min: 15, max: 40 },
	{ description: "Uber", category: "Transport", min: 8, max: 35 },
	{ description: "Fuel", category: "Transport", min: 30, max: 70 },
	{ description: "Train ticket", category: "Transport", min: 10, max: 45 },
	{ description: "Movie tickets", category: "Entertainment", min: 12, max: 40 },
	{ description: "Concert", category: "Entertainment", min: 40, max: 120 },
	{ description: "Video games", category: "Entertainment", min: 20, max: 70 },
	{ description: "Clothes", category: "Shopping", min: 25, max: 150 },
	{ description: "Electronics", category: "Shopping", min: 50, max: 300 },
	{ description: "Home goods", category: "Shopping", min: 15, max: 80 },
	{ description: "Pharmacy", category: "Health", min: 8, max: 45 },
	{ description: "Doctor visit", category: "Health", min: 30, max: 150 },
	{ description: "Flight", category: "Travel", min: 150, max: 500 },
	{ description: "Hotel", category: "Travel", min: 100, max: 300 },
];

// Deterministic PRNG so re-seeding produces the same data.
function mulberry32(seed) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function money(min, max, rand) {
	return (min + rand() * (max - min)).toFixed(2);
}

function dayInMonth(year, monthIndex, maxDay, rand) {
	const day = 1 + Math.floor(rand() * maxDay);
	return new Date(
		year,
		monthIndex,
		day,
		9 + Math.floor(rand() * 12),
		Math.floor(rand() * 60),
	);
}

/**
 * Seeds categories and ~6 months of expenses for local development.
 * Skips if the database already has categories (idempotent — never overwrites).
 */
async function seedExpenseData(prisma) {
	const existing = await prisma.category.findFirst({
		where: { name: SEED_CATEGORIES[0].name },
	});
	if (existing) {
		console.log("✓ Expense data already seeded — skipping");
		return;
	}

	const categoryIdByName = {};
	for (const { name, description } of SEED_CATEGORIES) {
		const category = await prisma.category.create({
			data: { name, description },
		});
		categoryIdByName[name] = category.id;
	}

	const rand = mulberry32(20261104);
	const now = new Date();
	const months = 6;
	const rows = [];

	for (let offset = months - 1; offset >= 0; offset--) {
		const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
		const maxDay = offset === 0 ? Math.min(28, now.getDate()) : 28;

		for (const rec of RECURRING_EXPENSES) {
			rows.push({
				description: rec.description,
				categoryId: categoryIdByName[rec.category],
				amount: rec.amount.toFixed(2),
				date: dayInMonth(d.getFullYear(), d.getMonth(), maxDay, rand),
			});
		}

		const discretionaryCount = 6 + Math.floor(rand() * 6);
		for (let i = 0; i < discretionaryCount; i++) {
			const pick =
				DISCRETIONARY_EXPENSES[
					Math.floor(rand() * DISCRETIONARY_EXPENSES.length)
				];
			rows.push({
				description: pick.description,
				categoryId: categoryIdByName[pick.category],
				amount: money(pick.min, pick.max, rand),
				date: dayInMonth(d.getFullYear(), d.getMonth(), maxDay, rand),
			});
		}

		if (offset % 3 === 0) {
			const flight = DISCRETIONARY_EXPENSES.find(
				(x) => x.description === "Flight",
			);
			const hotel = DISCRETIONARY_EXPENSES.find(
				(x) => x.description === "Hotel",
			);
			rows.push({
				description: flight.description,
				categoryId: categoryIdByName[flight.category],
				amount: money(flight.min, flight.max, rand),
				date: dayInMonth(d.getFullYear(), d.getMonth(), maxDay, rand),
			});
			rows.push({
				description: hotel.description,
				categoryId: categoryIdByName[hotel.category],
				amount: money(hotel.min, hotel.max, rand),
				date: dayInMonth(d.getFullYear(), d.getMonth(), maxDay, rand),
			});
		}
	}

	await prisma.expense.createMany({ data: rows });
	console.log(
		`✓ Seeded ${SEED_CATEGORIES.length} categories and ${rows.length} expenses across ${months} months`,
	);
}

async function main() {
	// Guard: require an explicit SEED_PROFILE when seeding a remote database.
	// Without this, a missing SEED_PROFILE silently defaults to "dev" and seeds
	// sample data onto production or staging databases.
	if (!process.env.SEED_PROFILE) {
		const host = process.env.POSTGRES_HOST || "";
		const url = process.env.DATABASE_URL || "";
		const isRemote =
			(host && host !== "localhost" && host !== "127.0.0.1") ||
			(url && !url.includes("localhost") && !url.includes("127.0.0.1"));
		if (isRemote) {
			console.error(
				"❌ Set SEED_PROFILE explicitly when seeding a remote database.\n" +
					"   Production: SEED_PROFILE=minimal pnpm db:seed\n" +
					"   Staging:    SEED_PROFILE=dev pnpm db:seed",
			);
			process.exit(1);
		}
	}

	// SEED_PROFILE is intentionally separate from NODE_ENV.
	// Railway sets NODE_ENV=production on ALL deployed services (including staging)
	// for build/performance reasons, so NODE_ENV cannot reliably distinguish staging
	// from production at seed time. Set SEED_PROFILE explicitly in your deploy command:
	//   production: SEED_PROFILE=minimal pnpm db:seed
	//   staging:    pnpm db:seed   (defaults to "dev")
	const seedProfile = process.env.SEED_PROFILE || "dev";
	console.log(`🌱 Seeding database with profile: "${seedProfile}"`);

	if (seedProfile === "minimal") {
		await seedMinimal(prisma);
	} else {
		await seedDev(prisma);
	}

	console.log("✅ Database seeding completed");
}

main().catch((error) => {
	console.error("❌ Seed failed:", error);
	process.exit(1);
});
