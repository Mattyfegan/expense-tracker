"use client";

import { useActionState } from "react";
import { createCategory } from "./actions.js";

export default function CategoryForm() {
	const [state, formAction, pending] = useActionState(createCategory, {
		error: null,
	});

	return (
		<form action={formAction}>
			{state.error ? <p style={{ color: "red" }}>{state.error}</p> : null}
			<input name="name" placeholder="Category name" required />
			<button type="submit" disabled={pending}>
				Add category
			</button>
		</form>
	);
}
