"use client";

import { useActionState } from "react";
import { createExpense } from "./actions.js";

export default function ExpenseForm({ categories }) {
	const [state, formAction, pending] = useActionState(createExpense, {
		error: null,
	});

	return (
		<form action={formAction}>
			{state.error ? <p style={{ color: "red" }}>{state.error}</p> : null}
			<div>
				<input name="description" placeholder="Description" required />
			</div>
			<div>
				<input
					name="amount"
					type="number"
					step="0.01"
					min="0"
					placeholder="Amount"
					required
				/>
			</div>
			<div>
				<input name="date" type="date" required />
			</div>
			<div>
				<select name="categoryId" required defaultValue="">
					<option value="" disabled>
						Category
					</option>
					{categories.map((c) => (
						<option key={c.id} value={c.id}>
							{c.name}
						</option>
					))}
				</select>
			</div>
			<div>
				<input name="note" placeholder="Note (optional)" />
			</div>
			<button type="submit" disabled={pending}>
				Add expense
			</button>
		</form>
	);
}
