"use client";

import { Button, Dialog, Input, Label } from "@expense-tracker/ui";
import { Check, Pencil, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { updateCategory } from "./actions.js";

export default function EditCategoryDialog({ category }) {
	const [open, setOpen] = useState(false);
	const [state, formAction, pending] = useActionState(updateCategory, {
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
				Rename
			</Button>
			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				title="Rename category"
			>
				{open ? (
					<form action={formAction} className="space-y-4">
						<input type="hidden" name="id" value={category.id} />
						{state.error ? (
							<p className="text-sm text-(--error-text)" role="alert">
								{state.error}
							</p>
						) : null}

						<div className="space-y-1.5">
							<Label htmlFor={`edit-category-name-${category.id}`}>Name</Label>
							<Input
								id={`edit-category-name-${category.id}`}
								name="name"
								defaultValue={category.name}
								required
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
