"use server";

import { category, categorySchema } from "@expense-tracker/db";
import { createLogger } from "@usequark/quark-core/core";
import { revalidatePath } from "next/cache";

const log = createLogger("category:action");

export async function createCategory(_prevState, formData) {
	const result = categorySchema.safeParse(Object.fromEntries(formData));
	if (!result.success) {
		return { error: result.error.issues[0]?.message ?? "Invalid input" };
	}

	try {
		const created = await category.create(result.data);
		log.info("category created", { id: created.id });
	} catch (err) {
		log.error("category create failed", { message: err?.message });
		return { error: "Could not create the category (it may already exist)." };
	}

	revalidatePath("/categories");
	revalidatePath("/expenses");
	return { error: null };
}

export async function updateCategory(formData) {
	const id = String(formData.get("id"));
	const result = categorySchema.safeParse({ name: formData.get("name") });
	if (!result.success) return;

	try {
		await category.update(id, result.data);
		log.info("category updated", { id });
	} catch (err) {
		log.error("category update failed", { id, message: err?.message });
		return;
	}

	revalidatePath("/categories");
	revalidatePath("/expenses");
}

export async function deleteCategory(formData) {
	const id = String(formData.get("id"));

	try {
		await category.delete(id);
		log.info("category deleted", { id });
	} catch (err) {
		log.error("category delete failed", { id, message: err?.message });
		return;
	}

	revalidatePath("/categories");
	revalidatePath("/expenses");
}
