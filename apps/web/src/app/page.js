import { category, expense } from "@expense-tracker/db";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@expense-tracker/ui";
import { Calculator, Receipt, Tag, Wallet } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import AppNav from "./_components/AppNav.js";
import SpendingChart from "./_components/SpendingChart.js";

export const dynamic = "force-dynamic";

function monthLabel(date) {
	return date.toLocaleDateString("en-US", { month: "short" });
}

export default async function DashboardPage() {
	const monthStart = new Date();
	monthStart.setDate(1);
	monthStart.setHours(0, 0, 0, 0);

	const [summary, recent, monthCount, monthly, categories] = await Promise.all([
		expense.summary(),
		expense.findAll({ take: 5 }),
		expense.count({ start: monthStart }),
		expense.monthlyTotals(6),
		category.findAll(),
	]);

	const categoryName = new Map(categories.map((c) => [c.id, c.name]));
	const byCategory = summary.byCategory
		.map((row) => ({
			name: categoryName.get(row.categoryId) ?? "Uncategorized",
			amount: Number(row._sum.amount ?? 0),
		}))
		.sort((a, b) => b.amount - a.amount);

	const total = Number(summary.total);
	const average = monthCount > 0 ? total / monthCount : 0;

	const chartData = monthly.map((m) => ({
		label: monthLabel(m.month),
		total: m.total,
	}));

	const topCategory = byCategory[0];

	const metrics = [
		{
			label: "Total spent",
			value: formatCurrency(total),
			subtext: "This month",
			icon: Wallet,
		},
		{
			label: "Transactions",
			value: String(monthCount),
			subtext: "This month",
			icon: Receipt,
		},
		{
			label: "Top category",
			value: topCategory ? formatCurrency(topCategory.amount) : "—",
			subtext: topCategory?.name ?? "No expenses yet",
			icon: Tag,
		},
		{
			label: "Average expense amount",
			value: formatCurrency(average),
			subtext: "Per transaction",
			icon: Calculator,
		},
	];

	return (
		<div>
			<AppNav />
			<main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
				<div>
					<h1 className="text-2xl font-bold">Dashboard</h1>
					<p className="mt-1 text-sm text-(--card-text-muted)">
						Your spending at a glance.
					</p>
				</div>

				<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{metrics.map(({ label, value, subtext, icon: Icon }) => (
						<Card key={label} className="p-6">
							<div className="flex items-center justify-between">
								<span className="text-xs font-medium uppercase tracking-wide text-(--card-text-muted)">
									{label}
								</span>
								<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--color-primary-muted) text-(--color-primary)">
									<Icon className="h-4 w-4" />
								</span>
							</div>
							<p className="mt-3 text-2xl font-semibold leading-tight">
								{value}
							</p>
							<p className="mt-1 text-xs text-(--card-text-muted)">{subtext}</p>
						</Card>
					))}
				</section>

				<section className="grid gap-8 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Spending by month</CardTitle>
							<p className="text-xs text-(--card-text-muted)">
								Total per month, last 6 months
							</p>
						</CardHeader>
						<CardContent>
							<SpendingChart data={chartData} />
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<div className="flex items-center justify-between gap-4">
								<div className="space-y-1.5">
									<CardTitle>Recent transactions</CardTitle>
									<p className="text-xs text-(--card-text-muted)">
										Your latest expenses
									</p>
								</div>
								<Button href="/expenses" variant="primary" size="sm">
									View all
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{recent.length === 0 ? (
								<p className="text-sm text-(--card-text-muted)">
									No expenses yet.
								</p>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>Description</TableHead>
											<TableHead>Category</TableHead>
											<TableHead>Amount</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{recent.map((e) => (
											<TableRow key={e.id}>
												<TableCell>{formatDate(e.date)}</TableCell>
												<TableCell>{e.description}</TableCell>
												<TableCell>{e.category.name}</TableCell>
												<TableCell>{formatCurrency(e.amount)}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</section>
			</main>
		</div>
	);
}
