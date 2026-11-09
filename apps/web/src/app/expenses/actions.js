"use server";

import { expense } from "@expense-tracker/db";
import { createLogger } from "@usequark/quark-core/core";
import { revalidatePath } from "next/cache";
import { normalizeExpense, parseExpense } from "./validation.js";

const log = createLogger("expense:action");

function refresh() {
	revalidatePath("/expenses");
	revalidatePath("/");
}

export async function createExpense(_prevState, formData) {
	const { error, data } = parseExpense(formData);
	if (error) return { error, success: false };

	try {
		const created = await expense.create(normalizeExpense(data));
		log.info("expense created", { id: created.id });
	} catch (err) {
		log.error("expense create failed", { message: err?.message });
		return {
			error: "Could not save the expense. Please try again.",
			success: false,
		};
	}

	refresh();
	return { error: null, success: true };
}

export async function updateExpense(_prevState, formData) {
	const id = String(formData.get("id"));
	const { error, data } = parseExpense(formData);
	if (error) return { error, success: false };

	try {
		await expense.update(id, normalizeExpense(data));
		log.info("expense updated", { id });
	} catch (err) {
		log.error("expense update failed", { id, message: err?.message });
		return {
			error: "Could not update the expense. Please try again.",
			success: false,
		};
	}

	refresh();
	return { error: null, success: true };
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

	refresh();
}
