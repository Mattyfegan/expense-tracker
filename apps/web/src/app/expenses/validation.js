import { expenseSchema } from "@expense-tracker/db";

export function normalizeExpense(data) {
	return {
		description: data.description,
		amount: data.amount,
		date: data.date,
		note: data.note?.trim() || null,
		categoryId: data.categoryId,
	};
}

export function parseExpense(formData) {
	const result = expenseSchema.safeParse(Object.fromEntries(formData));
	if (!result.success) {
		return {
			error: result.error.issues[0]?.message ?? "Invalid input",
			data: null,
		};
	}
	return { error: null, data: result.data };
}
