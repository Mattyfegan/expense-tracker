"use client";

import { Button } from "@expense-tracker/ui";
import { Download } from "lucide-react";
import { useState } from "react";

export default function ExportExpensesButton({
	href = "/api/expenses/export",
	filename = "expenses.csv",
}) {
	const [loading, setLoading] = useState(false);

	async function handleClick() {
		setLoading(true);
		try {
			const response = await fetch(href);
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = filename;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			URL.revokeObjectURL(url);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Button
			type="button"
			icon={<Download />}
			loading={loading}
			onClick={handleClick}
		>
			Export to CSV
		</Button>
	);
}
