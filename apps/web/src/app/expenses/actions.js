"use server";

import { expense, expenseSchema } from "@expense-tracker/db";
import { createLogger } from "@usequark/quark-core/core";
import { revalidatePath } from "next/cache";

const log = createLogger("expense:action");

function normalize(data) {
	return {
		description: data.description,
		amount: data.amount,
		date: data.date,
		note: data.note?.trim() || null,
		categoryId: data.categoryId,
	};
}

function parse(formData) {
	const result = expenseSchema.safeParse(Object.fromEntries(formData));
	if (!result.success) {
		return {
			error: result.error.issues[0]?.message ?? "Invalid input",
			data: null,
		};
	}
	return { error: null, data: result.data };
}

export async function createExpense(_prevState, formData) {
	const { error, data } = parse(formData);
	if (error) return { error };

	try {
		const created = await expense.create(normalize(data));
		log.info("expense created", { id: created.id });
	} catch (err) {
		log.error("expense create failed", { message: err?.message });
		return { error: "Could not save the expense. Please try again." };
	}

	revalidatePath("/expenses");
	revalidatePath("/dashboard");
	return { error: null };
}

export async function updateExpense(formData) {
	const id = String(formData.get("id"));
	const { error, data } = parse(formData);
	if (error) return;

	try {
		await expense.update(id, normalize(data));
		log.info("expense updated", { id });
	} catch (err) {
		log.error("expense update failed", { id, message: err?.message });
		return;
	}

	revalidatePath("/expenses");
	revalidatePath("/dashboard");
}

export async function deleteExpense(formData) {
	const id = String(formData.get("id"));

	try {
		await expense.delete(id);
		log.info("expense deleted", { id });
	} catch (err) {
		log.error("expense delete failed", { id, message: err?.message });
		return;
	}

	revalidatePath("/expenses");
	revalidatePath("/dashboard");
}
