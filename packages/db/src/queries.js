import { prisma } from "./client.js";

/**
 * Safe select for user queries - excludes sensitive fields (password).
 * Use this on any query whose result is returned to the client.
 */
const USER_SAFE_SELECT = {
	id: true,
	email: true,
	emailVerified: true,
	name: true,
	image: true,
	role: true,
	passwordChangedAt: true,
	createdAt: true,
	updatedAt: true,
};

/**
 * Look up an actor's email for the AuditLog snapshot.
 *
 * The lookup cannot miss: the foreign key rejects a `userId` that names no user,
 * so `onDelete: SetNull` is the only way `userId` becomes null, and it happens after
 * the snapshot was written. A null `userId` here means the caller supplied none.
 */
async function resolveActorEmail(userId) {
	if (!userId) return null;
	const actor = await prisma.user.findUnique({
		where: { id: userId },
		select: { email: true },
	});
	return actor?.email ?? null;
}

export { USER_SAFE_SELECT };

// User queries
export const user = {
	findById: (id) => {
		return prisma.user.findUnique({
			where: { id },
			select: USER_SAFE_SELECT,
		});
	},

	/**
	 * findByEmail returns ALL fields including password.
	 * Only use for internal auth - never expose the result directly to clients.
	 */
	findByEmail: (email) => {
		return prisma.user.findUnique({
			where: { email },
		});
	},
	findAll: (options = {}) => {
		const { skip = 0, take = 10 } = options;
		return prisma.user.findMany({
			skip,
			take,
			select: USER_SAFE_SELECT,
			orderBy: { createdAt: "desc" },
		});
	},
	create: (data) => {
		return prisma.user.create({
			data,
			select: USER_SAFE_SELECT,
		});
	},
	update: (id, data) => {
		return prisma.user.update({
			where: { id },
			data,
			select: USER_SAFE_SELECT,
		});
	},
	delete: (id) => {
		return prisma.user.delete({
			where: { id },
		});
	},
	count: () => {
		return prisma.user.count();
	},
};

// Job queries
export const job = {
	findAll: (options = {}) => {
		const { skip = 0, take = 50, where = {} } = options;
		return prisma.job.findMany({
			skip,
			take,
			where,
			orderBy: { createdAt: "desc" },
		});
	},

	findById: (id) => {
		return prisma.job.findUnique({ where: { id } });
	},

	upsert: (id, data) => {
		return prisma.job.upsert({
			where: { id },
			create: { id, ...data },
			update: data,
		});
	},
};

// Account queries (NextAuth)
export const account = {
	findById: (id) => {
		return prisma.account.findUnique({
			where: { id },
		});
	},
	findByUserIdAndProvider: (userId, provider) => {
		return prisma.account.findFirst({
			where: { userId, provider },
		});
	},
	findByUser: (userId) => {
		return prisma.account.findMany({
			where: { userId },
		});
	},
	create: (data) => {
		return prisma.account.create({
			data,
		});
	},
	delete: (id) => {
		return prisma.account.delete({
			where: { id },
		});
	},
};

// Session queries (NextAuth)
//
// App-owned helpers, not Auth.js storage: the scaffold pins
// `session.strategy: "jwt"` (see `apps/web/src/lib/auth.js`), under which
// Auth.js neither reads nor writes session rows — revocation is enforced by
// `validateSessionToken` re-reading the user row instead. Kept for apps that
// need server-side session bookkeeping of their own.
export const session = {
	findByToken: (sessionToken) => {
		return prisma.session.findUnique({
			where: { sessionToken },
			include: { user: { select: USER_SAFE_SELECT } },
		});
	},
	findByUserId: (userId) => {
		return prisma.session.findMany({
			where: { userId },
		});
	},
	create: (data) => {
		return prisma.session.create({
			data,
			include: { user: { select: USER_SAFE_SELECT } },
		});
	},
	update: (sessionToken, data) => {
		return prisma.session.update({
			where: { sessionToken },
			data,
		});
	},
	delete: (sessionToken) => {
		return prisma.session.delete({
			where: { sessionToken },
		});
	},
	deleteByUserId: (userId) => {
		return prisma.session.deleteMany({
			where: { userId },
		});
	},
};

// Verification Token queries (NextAuth)
export const verificationToken = {
	findByToken: (token) => {
		return prisma.verificationToken.findUnique({
			where: { token },
		});
	},
	findByIdentifierAndToken: (identifier, token) => {
		return prisma.verificationToken.findUnique({
			where: { identifier_token: { identifier, token } },
		});
	},
	create: (data) => {
		return prisma.verificationToken.create({
			data,
		});
	},
	delete: (identifier, token) => {
		return prisma.verificationToken.deleteMany({
			where: { identifier, token },
		});
	},
	/**
	 * Removes every token for an identifier.
	 *
	 * A verification or reset flow issues one live token per address: without
	 * this, requesting a second link leaves the first valid too, so an old email
	 * keeps working after the user asked for a new one. Called before issuing a
	 * replacement, and again once a token has been redeemed.
	 */
	deleteByIdentifier: (identifier) => {
		return prisma.verificationToken.deleteMany({
			where: { identifier },
		});
	},
	deleteExpired: () => {
		return prisma.verificationToken.deleteMany({
			where: { expires: { lt: new Date() } },
		});
	},
};

// AuditLog queries
//
// `user` is optional: a deleted user leaves `userId` null but the row survives
// (see the AuditLog model). Every read therefore returns `actorEmail` alongside,
// so a caller can name the actor without dereferencing `user`. Render `actorEmail`
// — `user` is for callers that need the live row, e.g. to follow through to the
// user's current role.
const AUDIT_ACTOR_SELECT = { id: true, email: true, name: true };

export const auditLog = {
	findAll: (options = {}) => {
		const { skip = 0, take = 50 } = options;
		return prisma.auditLog.findMany({
			skip,
			take,
			include: { user: { select: AUDIT_ACTOR_SELECT } },
			orderBy: { createdAt: "desc" },
		});
	},
	findByUserId: (userId, options = {}) => {
		const { skip = 0, take = 50 } = options;
		return prisma.auditLog.findMany({
			where: { userId },
			skip,
			take,
			include: { user: { select: AUDIT_ACTOR_SELECT } },
			orderBy: { createdAt: "desc" },
		});
	},
	findByEntity: (entity, options = {}) => {
		const { skip = 0, take = 50 } = options;
		return prisma.auditLog.findMany({
			where: { entity },
			skip,
			take,
			include: { user: { select: AUDIT_ACTOR_SELECT } },
			orderBy: { createdAt: "desc" },
		});
	},
	findByAction: (action, options = {}) => {
		const { skip = 0, take = 50 } = options;
		return prisma.auditLog.findMany({
			where: { action },
			skip,
			take,
			include: { user: { select: AUDIT_ACTOR_SELECT } },
			orderBy: { createdAt: "desc" },
		});
	},
	/**
	 * Create an audit record, snapshotting the actor's email.
	 *
	 * The snapshot is written here rather than left to the caller because it is the
	 * only thing that keeps the record attributable once the user row is gone:
	 * `onDelete: SetNull` preserves the row but clears `userId`. A caller that
	 * forgets the field gets a permanent record naming nobody, so this derives it
	 * from `userId` when not supplied.
	 */
	create: async (data) => {
		const actorEmail =
			data.actorEmail ?? (await resolveActorEmail(data.userId));
		return prisma.auditLog.create({
			data: { ...data, actorEmail },
			include: { user: { select: AUDIT_ACTOR_SELECT } },
		});
	},
};

// File queries
export const file = {
	create: (data) => {
		return prisma.file.create({ data });
	},
	findById: (id) => {
		return prisma.file.findUnique({
			where: { id },
			include: {
				uploadedBy: { select: { id: true, email: true, name: true } },
			},
		});
	},
	findByStorageKey: (storageKey) => {
		return prisma.file.findUnique({ where: { storageKey } });
	},
	findByUploader: (uploadedById, options = {}) => {
		const { skip = 0, take = 50 } = options;
		return prisma.file.findMany({
			where: { uploadedById },
			skip,
			take,
			orderBy: { createdAt: "desc" },
		});
	},
	findOrphaned: (options = {}) => {
		const { take = 100 } = options;
		return prisma.file.findMany({
			where: { uploadedById: null },
			take,
			orderBy: { createdAt: "asc" },
		});
	},
	findOlderThan: (date, options = {}) => {
		const { take = 100 } = options;
		return prisma.file.findMany({
			where: {
				uploadedById: null,
				createdAt: { lt: date },
			},
			take,
			orderBy: { createdAt: "asc" },
		});
	},
	delete: (id) => {
		return prisma.file.delete({ where: { id } });
	},
	/**
	 * Deletes a File row and reports whether this call was the one that removed
	 * it.
	 *
	 * `delete()` throws P2025 when the row is already gone, which is the normal
	 * outcome of two concurrent DELETEs of the same file and is not an error
	 * worth surfacing. This returns `{ count }` instead so the caller can tell
	 * "I deleted it" from "someone beat me to it" and skip the destructive
	 * follow-up (removing the storage object) in the second case.
	 *
	 * A count of 1 means the caller owns the cleanup. Any incoming relation
	 * added later still surfaces here as a P2003 foreign-key error, before the
	 * storage object has been touched.
	 */
	deleteIfPresent: (id) => {
		return prisma.file.deleteMany({ where: { id } });
	},
	deleteMany: (ids) => {
		return prisma.file.deleteMany({ where: { id: { in: ids } } });
	},
	count: (where = {}) => {
		return prisma.file.count({ where });
	},
};

// Category queries
//
// Deleting a category cascades to its expenses (`onDelete: Cascade` on the
// Expense.categoryId relation), so one delete removes the whole subtree.
export const category = {
	findAll: (options = {}) => {
		const { skip = 0, take = 50, orderBy = { name: "asc" } } = options;
		return prisma.category.findMany({
			skip,
			take,
			include: { _count: { select: { expenses: true } } },
			orderBy,
		});
	},
	findAllWithExpenseTotals: async (options = {}) => {
		const categories = await category.findAll(options);
		if (categories.length === 0) return categories;

		const totals = await prisma.expense.groupBy({
			by: ["categoryId"],
			where: { categoryId: { in: categories.map((item) => item.id) } },
			_sum: { amount: true },
		});
		const totalsByCategory = new Map(
			totals.map((item) => [item.categoryId, item._sum.amount ?? 0]),
		);

		return categories.map((item) => ({
			...item,
			expenseTotal: totalsByCategory.get(item.id) ?? 0,
		}));
	},

	findById: (id) => {
		return prisma.category.findUnique({
			where: { id },
			include: { _count: { select: { expenses: true } } },
		});
	},

	create: (data) => {
		return prisma.category.create({ data });
	},

	update: (id, data) => {
		return prisma.category.update({ where: { id }, data });
	},

	delete: (id) => {
		return prisma.category.delete({ where: { id } });
	},

	count: (where = {}) => {
		return prisma.category.count({ where });
	},
};

/**
 * Builds the `where` clause shared by `expense.findAll` and `expense.count`,
 * so pagination and total counts agree on the same filters.
 *
 * - categoryId: exact match
 * - start / end: inclusive date range on `date`
 * - q: case-insensitive substring match on `description`, `note`, and category name
 */
function buildExpenseWhere(options) {
	const { categoryId, start, end, q } = options;
	const where = {};

	if (categoryId) {
		where.categoryId = categoryId;
	}

	if (start || end) {
		where.date = {};
		if (start) where.date.gte = new Date(start);
		if (end) where.date.lte = new Date(end);
	}

	if (q) {
		where.OR = [
			{ description: { contains: q, mode: "insensitive" } },
			{ note: { contains: q, mode: "insensitive" } },
			{ category: { name: { contains: q, mode: "insensitive" } } },
		];
	}

	return where;
}

// Expense queries
export const expense = {
	findAll: (options = {}) => {
		const { skip = 0, take = 50, orderBy = { date: "desc" } } = options;
		return prisma.expense.findMany({
			skip,
			take,
			where: buildExpenseWhere(options),
			include: { category: true },
			orderBy,
		});
	},

	findById: (id) => {
		return prisma.expense.findUnique({
			where: { id },
			include: { category: true },
		});
	},

	create: (data) => {
		return prisma.expense.create({
			data,
			include: { category: true },
		});
	},

	update: (id, data) => {
		return prisma.expense.update({
			where: { id },
			data,
			include: { category: true },
		});
	},

	delete: (id) => {
		return prisma.expense.delete({ where: { id } });
	},

	count: (options = {}) => {
		return prisma.expense.count({ where: buildExpenseWhere(options) });
	},

	/**
	 * Month-to-date summary: total spend plus a per-category breakdown.
	 * Used by the dashboard page.
	 */
	summary: async () => {
		const now = new Date();
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const [total, byCategory] = await Promise.all([
			prisma.expense.aggregate({
				where: { date: { gte: monthStart } },
				_sum: { amount: true },
			}),
			prisma.expense.groupBy({
				by: ["categoryId"],
				where: { date: { gte: monthStart } },
				_sum: { amount: true },
			}),
		]);
		return {
			monthStart,
			total: total._sum.amount ?? 0,
			byCategory,
		};
	},

	/**
	 * Total spend per month for the last `months` months (oldest first).
	 * Each entry is `{ month: Date, total: number }`.
	 */
	monthlyTotals: async (months = 6) => {
		const start = new Date();
		start.setDate(1);
		start.setHours(0, 0, 0, 0);
		start.setMonth(start.getMonth() - (months - 1));

		const rows = await prisma.expense.findMany({
			where: { date: { gte: start } },
			select: { date: true, amount: true },
			orderBy: { date: "asc" },
		});

		const totals = new Map();
		for (const row of rows) {
			const key = `${row.date.getFullYear()}-${row.date.getMonth()}`;
			totals.set(key, (totals.get(key) ?? 0) + Number(row.amount));
		}

		const result = [];
		for (let i = months - 1; i >= 0; i--) {
			const d = new Date();
			d.setDate(1);
			d.setHours(0, 0, 0, 0);
			d.setMonth(d.getMonth() - i);
			const key = `${d.getFullYear()}-${d.getMonth()}`;
			result.push({ month: d, total: totals.get(key) ?? 0 });
		}
		return result;
	},
};
