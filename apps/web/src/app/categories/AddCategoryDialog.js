"use client";

import { Button, Dialog, Input, Label, Textarea } from "@expense-tracker/ui";
import { useActionState, useEffect, useState } from "react";
import { createCategory } from "./actions.js";

export default function AddCategoryDialog() {
	const [open, setOpen] = useState(false);
	const [state, formAction, pending] = useActionState(createCategory, {
		error: null,
		success: false,
	});

	useEffect(() => {
		if (state.success) setOpen(false);
	}, [state]);

	return (
		<>
			<Button variant="primary" onClick={() => setOpen(true)}>
				Add category
			</Button>
			<Dialog open={open} onClose={() => setOpen(false)} title="Add category">
				<form action={formAction} className="space-y-4">
					{state.error ? (
						<p className="text-sm text-(--error-text)">{state.error}</p>
					) : null}

					<div className="space-y-1.5">
						<Label htmlFor="name">Name</Label>
						<Input id="name" name="name" placeholder="e.g. Food" required />
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="description">Description (optional)</Label>
						<Textarea
							id="description"
							name="description"
							rows={2}
							placeholder="e.g. Groceries, restaurants, and dining out"
						/>
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
