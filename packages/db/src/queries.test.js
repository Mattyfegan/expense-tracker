import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

// .env is gitignored and absent in CI — the workflow provides POSTGRES_* env
// vars directly. Load it only when it exists.
try {
	process.loadEnvFile(
		resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env"),
	);
} catch {
	// no .env (CI) — rely on process.env provided by the runner.
}

const { category, expense } = await import("./queries.js");

test("expense CRUD: create and find by id", async (t) => {
	const cat = await category.create({ name: `test-${Date.now()}` });
	const created = await expense.create({
		description: "Lunch",
		amount: "12.50",
		date: new Date("2026-11-01T12:00:00.000Z"),
		note: "team lunch",
		categoryId: cat.id,
	});

	t.after(async () => {
		await category.delete(cat.id).catch(() => {});
	});

	const found = await expense.findById(created.id);
	assert.ok(found, "expected to find the created expense");
	assert.equal(found.id, created.id);
	assert.equal(found.description, "Lunch");
	assert.equal(Number(found.amount), 12.5);
	assert.equal(found.categoryId, cat.id);
	assert.equal(found.category.name, cat.name);
});

test("expense CRUD: filter, update, and delete", async (t) => {
	const cat = await category.create({ name: `test-${Date.now()}` });
	const created = await expense.create({
		description: "Groceries",
		amount: "43.20",
		date: new Date("2026-11-02T12:00:00.000Z"),
		categoryId: cat.id,
	});

	t.after(async () => {
		await category.delete(cat.id).catch(() => {});
	});

	const updated = await expense.update(created.id, {
		description: "Groceries (weekly)",
	});
	assert.equal(updated.description, "Groceries (weekly)");

	const filtered = await expense.findAll({
		categoryId: cat.id,
		q: "groceries",
	});
	assert.ok(
		filtered.some((e) => e.id === created.id),
		"expected the expense to match the category + search filter",
	);

	await expense.delete(created.id);
	assert.equal(await expense.findById(created.id), null);
});
