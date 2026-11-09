import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeExpense, parseExpense } from "./validation.js";

function expenseForm(overrides = {}) {
	const formData = new FormData();
	const fields = {
		description: "Lunch",
		amount: "12.50",
		date: "2020-01-01",
		note: "team lunch",
		categoryId: "cat-1",
		...overrides,
	};
	for (const [key, value] of Object.entries(fields)) {
		formData.set(key, value);
	}
	return formData;
}

test("parseExpense accepts valid input and returns data", () => {
	const { error, data } = parseExpense(expenseForm());
	assert.equal(error, null);
	assert.equal(data.description, "Lunch");
	assert.equal(data.amount, "12.50");
	assert.equal(data.categoryId, "cat-1");
});

test("parseExpense returns the first validation message on invalid input", () => {
	const { error, data } = parseExpense(expenseForm({ amount: "0" }));
	assert.equal(data, null);
	assert.match(error, /positive number/);
});

test("normalizeExpense trims a note and maps an empty note to null", () => {
	assert.equal(normalizeExpense({ note: "  padded  " }).note, "padded");
	assert.equal(normalizeExpense({ note: "" }).note, null);
	assert.equal(normalizeExpense({ note: "   " }).note, null);
	assert.equal(normalizeExpense({}).note, null);
});

test("normalizeExpense passes through the other fields untouched", () => {
	const data = {
		description: "Groceries",
		amount: "43.20",
		date: new Date("2020-01-01"),
		categoryId: "cat-2",
	};
	assert.deepEqual(normalizeExpense(data), {
		description: "Groceries",
		amount: "43.20",
		date: data.date,
		note: null,
		categoryId: "cat-2",
	});
});
