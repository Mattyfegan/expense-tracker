"use client";

import {
	Button,
	Dialog,
	Input,
	Label,
	Select,
	Textarea,
} from "@expense-tracker/ui";
import { useActionState, useEffect, useState } from "react";
import { createExpense } from "./actions.js";

export default function AddExpenseDialog({ categories }) {
	const [open, setOpen] = useState(false);
	const [state, formAction, pending] = useActionState(createExpense, {
		error: null,
		success: false,
	});

	useEffect(() => {
		if (state.success) setOpen(false);
	}, [state]);

	return (
		<>
			<Button variant="primary" onClick={() => setOpen(true)}>
				Add expense
			</Button>
			<Dialog open={open} onClose={() => setOpen(false)} title="Add expense">
				<form action={formAction} className="space-y-4">
					{state.error ? (
						<p className="text-sm text-(--error-text)">{state.error}</p>
					) : null}

					<div className="space-y-1.5">
						<Label htmlFor="description">Description</Label>
						<Input
							id="description"
							name="description"
							placeholder="e.g. Groceries"
							required
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="amount">Amount</Label>
						<Input
							id="amount"
							name="amount"
							type="number"
							step="0.01"
							min="0"
							required
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="date">Date</Label>
						<Input id="date" name="date" type="date" required />
					</div>

					<div className="space-y-1.5">
						<Label>Category</Label>
						<Select name="categoryId" required>
							<option value="" disabled>
								Select a category
							</option>
							{categories.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</Select>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="note">Note (optional)</Label>
						<Textarea id="note" name="note" rows={2} />
					</div>

					<div className="flex justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" variant="primary" loading={pending}>
							Save
						</Button>
					</div>
				</form>
			</Dialog>
		</>
	);
}
