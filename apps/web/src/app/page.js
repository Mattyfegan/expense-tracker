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
export const metadata = { title: { absolute: "Dashboard" } };

function monthLabel(date) {
	return date.toLocaleDateString("en-US", { month: "short" });
}

function compactDate(date) {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	});
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
			<main className="mx-auto min-w-0 max-w-6xl space-y-8 overflow-x-clip px-4 py-8 sm:px-6">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-primary)">
						Overview
					</p>
					<h1 className="mt-2 text-3xl font-bold tracking-tight">Dashboard</h1>
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

				<section className="grid min-w-0 gap-6 lg:grid-cols-2">
					<Card className="min-w-0 overflow-hidden">
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

					<Card className="min-w-0 overflow-hidden">
						<CardHeader>
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div className="space-y-1.5">
									<CardTitle>Recent transactions</CardTitle>
									<p className="text-xs text-(--card-text-muted)">
										Your latest expenses
									</p>
								</div>
								<Button
									href="/expenses"
									variant="primary"
									size="sm"
									className="self-start sm:self-auto"
								>
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
								<Table className="min-w-[36rem]">
									<TableHeader>
										<TableRow>
											<TableHead className="w-20">Date</TableHead>
											<TableHead>Description</TableHead>
											<TableHead>Category</TableHead>
											<TableHead className="w-24 text-right">Amount</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{recent.map((e) => (
											<TableRow key={e.id}>
												<TableCell className="whitespace-nowrap text-xs sm:text-sm">
													<span className="sm:hidden">
														{compactDate(e.date)}
													</span>
													<span className="hidden sm:inline">
														{formatDate(e.date)}
													</span>
												</TableCell>
												<TableCell className="max-w-0 break-words">
													{e.description}
												</TableCell>
												<TableCell className="max-w-0 break-words">
													{e.category.name}
												</TableCell>
												<TableCell className="whitespace-nowrap text-right font-semibold tabular-nums">
													{formatCurrency(e.amount)}
												</TableCell>
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
