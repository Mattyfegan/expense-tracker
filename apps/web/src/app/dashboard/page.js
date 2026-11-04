import { category, expense } from "@expense-tracker/db";
import AppNav from "../_components/AppNav.js";

function formatAmount(amount) {
	return Number(amount ?? 0).toFixed(2);
}

export default async function DashboardPage() {
	const [summary, categories] = await Promise.all([
		expense.summary(),
		category.findAll(),
	]);

	const categoryNames = new Map(categories.map((c) => [c.id, c.name]));

	const breakdown = summary.byCategory
		.map((row) => ({
			name: categoryNames.get(row.categoryId) ?? "Unknown",
			amount: row._sum.amount ?? 0,
		}))
		.sort((a, b) => Number(b.amount) - Number(a.amount));

	return (
		<main>
			<AppNav />
			<h1>Dashboard</h1>

			<h2>This month</h2>
			<p>Total spent: ${formatAmount(summary.total)}</p>

			<h3>By category</h3>
			{breakdown.length === 0 ? (
				<p>No expenses this month yet.</p>
			) : (
				<ul>
					{breakdown.map((b) => (
						<li key={b.name}>
							{b.name}: ${formatAmount(b.amount)}
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
