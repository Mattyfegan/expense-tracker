"use client";

import {
	Button,
	Dialog,
	Input,
	Label,
	Select,
	Textarea,
} from "@expense-tracker/ui";
import { Check, Pencil, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { updateExpense } from "./actions.js";

export default function EditExpenseDialog({ expense, categories }) {
	const [open, setOpen] = useState(false);
	const [state, formAction, pending] = useActionState(updateExpense, {
		error: null,
		success: false,
	});

	useEffect(() => {
		if (state.success) setOpen(false);
	}, [state.success]);

	return (
		<>
			<Button
				size="sm"
				variant="outline"
				icon={<Pencil />}
				onClick={() => setOpen(true)}
			>
				Edit
			</Button>
			<Dialog open={open} onClose={() => setOpen(false)} title="Edit expense">
				{open ? (
					<form action={formAction} className="space-y-4">
						<input type="hidden" name="id" value={expense.id} />
						{state.error ? (
							<p className="text-sm text-(--error-text)" role="alert">
								{state.error}
							</p>
						) : null}

						<div className="space-y-1.5">
							<Label htmlFor={`edit-description-${expense.id}`}>
								Description
							</Label>
							<Input
								id={`edit-description-${expense.id}`}
								name="description"
								defaultValue={expense.description}
								required
							/>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor={`edit-amount-${expense.id}`}>Amount</Label>
								<Input
									id={`edit-amount-${expense.id}`}
									name="amount"
									type="number"
									step="0.01"
									min="0"
									defaultValue={expense.amount}
									required
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor={`edit-date-${expense.id}`}>Date</Label>
								<Input
									id={`edit-date-${expense.id}`}
									name="date"
									type="date"
									defaultValue={expense.date.slice(0, 10)}
									required
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor={`edit-category-${expense.id}`}>Category</Label>
							<Select
								id={`edit-category-${expense.id}`}
								name="categoryId"
								defaultValue={expense.categoryId}
							>
								{categories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))}
							</Select>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor={`edit-note-${expense.id}`}>Note (optional)</Label>
							<Textarea
								id={`edit-note-${expense.id}`}
								name="note"
								defaultValue={expense.note ?? ""}
								rows={2}
							/>
						</div>

						<div className="flex justify-end gap-2 pt-2">
							<Button
								type="button"
								variant="danger"
								icon={<X />}
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								variant="primary"
								icon={<Check />}
								loading={pending}
							>
								Save changes
							</Button>
						</div>
					</form>
				) : null}
			</Dialog>
		</>
	);
}
