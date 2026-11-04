import assert from "node:assert/strict";
import { test } from "node:test";
import { categorySchema, expenseSchema } from "./schemas.js";

function validExpense(overrides = {}) {
	return {
		description: "Lunch",
		amount: "12.50",
		date: "2020-01-01",
		note: "",
		categoryId: "cat-1",
		...overrides,
	};
}

test("expenseSchema accepts a valid expense", () => {
	const result = expenseSchema.safeParse(validExpense());
	assert.equal(result.success, true);
});

test("expenseSchema accepts an amount with exactly 2 decimal places", () => {
	const result = expenseSchema.safeParse(validExpense({ amount: "12.50" }));
	assert.equal(result.success, true);
});

test("expenseSchema rejects an amount with more than 2 decimal places", () => {
	const result = expenseSchema.safeParse(
		validExpense({ amount: "1.23443443" }),
	);
	assert.equal(result.success, false);
	assert.match(result.error.issues[0].message, /2 decimal places/);
});

test("expenseSchema rejects a negative amount", () => {
	const result = expenseSchema.safeParse(validExpense({ amount: "-5" }));
	assert.equal(result.success, false);
});

test("expenseSchema rejects a zero amount", () => {
	const result = expenseSchema.safeParse(validExpense({ amount: "0" }));
	assert.equal(result.success, false);
});

test("expenseSchema rejects a non-numeric amount", () => {
	const result = expenseSchema.safeParse(validExpense({ amount: "abc" }));
	assert.equal(result.success, false);
});

test("expenseSchema rejects an amount that is too large", () => {
	const result = expenseSchema.safeParse(
		validExpense({ amount: "999999999999" }),
	);
	assert.equal(result.success, false);
	assert.match(result.error.issues[0].message, /too large/);
});

test("expenseSchema rejects a future date", () => {
	const result = expenseSchema.safeParse(validExpense({ date: "2099-01-01" }));
	assert.equal(result.success, false);
	assert.match(result.error.issues[0].message, /future/);
});

test("expenseSchema rejects an empty description", () => {
	const result = expenseSchema.safeParse(validExpense({ description: "   " }));
	assert.equal(result.success, false);
});

test("expenseSchema rejects a description that is too long", () => {
	const result = expenseSchema.safeParse(
		validExpense({ description: "x".repeat(300) }),
	);
	assert.equal(result.success, false);
});

test("expenseSchema rejects an empty category", () => {
	const result = expenseSchema.safeParse(validExpense({ categoryId: "" }));
	assert.equal(result.success, false);
});

test("categorySchema rejects an empty name", () => {
	const result = categorySchema.safeParse({ name: "" });
	assert.equal(result.success, false);
});

test("categorySchema rejects a name that is too long", () => {
	const result = categorySchema.safeParse({ name: "x".repeat(60) });
	assert.equal(result.success, false);
});
