"use server";

import { category, categorySchema } from "@expense-tracker/db";
import { createLogger } from "@usequark/quark-core/core";
import { revalidatePath } from "next/cache";

const log = createLogger("category:action");

function refresh() {
	revalidatePath("/categories");
	revalidatePath("/expenses");
	revalidatePath("/");
}

export async function createCategory(_prevState, formData) {
	const result = categorySchema.safeParse(Object.fromEntries(formData));
	if (!result.success) {
		return {
			error: result.error.issues[0]?.message ?? "Invalid input",
			success: false,
		};
	}

	try {
		const created = await category.create({
			name: result.data.name,
			description: result.data.description || null,
		});
		log.info("category created", { id: created.id });
	} catch (err) {
		log.error("category create failed", { message: err?.message });
		return {
			error: "Could not create the category (it may already exist).",
			success: false,
		};
	}

	refresh();
	return { error: null, success: true };
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

	refresh();
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

	refresh();
}
