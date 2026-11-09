import { category, expense } from "@expense-tracker/db";
import {
	Badge,
	Button,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@expense-tracker/ui";
import {
	ArrowDown,
	ArrowUp,
	ChevronLeft,
	ChevronRight,
	ChevronsUpDown,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import AppNav from "../_components/AppNav.js";
import AddExpenseDialog from "./AddExpenseDialog.js";
import { deleteExpense } from "./actions.js";
import EditExpenseDialog from "./EditExpenseDialog.js";
import ExportExpensesButton from "./ExportExpensesButton.js";
import Filters from "./Filters.js";

export const dynamic = "force-dynamic";
export const metadata = { title: { absolute: "Expenses" } };

const PAGE_SIZE = 10;

function SortIndicator({ field, sortField, sortDir }) {
	if (sortField !== field) {
		return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
	}
	return sortDir === "asc" ? (
		<ArrowUp className="h-3.5 w-3.5" />
	) : (
		<ArrowDown className="h-3.5 w-3.5" />
	);
}

export default async function ExpensesPage({ searchParams }) {
	const params = await searchParams;
	const page = Math.max(1, Number(params.page) || 1);
	const q = typeof params.q === "string" ? params.q : undefined;
	const categoryId =
		typeof params.categoryId === "string" ? params.categoryId : undefined;
	const sortField = typeof params.sort === "string" ? params.sort : "date";
	const sortDir = params.dir === "asc" ? "asc" : "desc";
	const skip = (page - 1) * PAGE_SIZE;

	const orderBy = {
		date: { date: sortDir },
		description: { description: sortDir },
		amount: { amount: sortDir },
		category: { category: { name: sortDir } },
	}[sortField] ?? { date: sortDir };

	const [expenses, total, categories] = await Promise.all([
		expense.findAll({ skip, take: PAGE_SIZE, q, categoryId, orderBy }),
		expense.count({ q, categoryId }),
		category.findAll(),
	]);

	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));

	const exportParams = new URLSearchParams();
	if (q) exportParams.set("q", q);
	if (categoryId) exportParams.set("categoryId", categoryId);
	exportParams.set("sort", sortField);
	exportParams.set("dir", sortDir);
	const exportHref = `/api/expenses/export?${exportParams.toString()}`;

	function href(pageNum) {
		const sp = new URLSearchParams();
		if (q) sp.set("q", q);
		if (categoryId) sp.set("categoryId", categoryId);
		sp.set("sort", sortField);
		sp.set("dir", sortDir);
		if (pageNum > 1) sp.set("page", String(pageNum));
		return `/expenses?${sp.toString()}`;
	}

	function sortHref(field) {
		const nextDir = sortField === field && sortDir === "asc" ? "desc" : "asc";
		const sp = new URLSearchParams();
		if (q) sp.set("q", q);
		if (categoryId) sp.set("categoryId", categoryId);
		sp.set("sort", field);
		sp.set("dir", nextDir);
		return `/expenses?${sp.toString()}`;
	}

	return (
		<div>
			<AppNav />
			<main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-primary)">
							Spending ledger
						</p>
						<h1 className="mt-2 text-3xl font-bold tracking-tight">Expenses</h1>
						<p className="mt-1 text-sm text-(--card-text-muted)">
							Review, filter, and update every transaction in one place.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<AddExpenseDialog categories={categoryOptions} />
						<ExportExpensesButton href={exportHref} />
					</div>
				</div>

				<Filters categories={categoryOptions} q={q} categoryId={categoryId} />

				{expenses.length === 0 ? (
					<div className="rounded-xl border border-dashed border-(--card-border) bg-(--card-bg) px-6 py-12 text-center">
						<p className="font-semibold">No expenses found</p>
						<p className="mt-1 text-sm text-(--card-text-muted)">
							Try changing your filters or add your first expense.
						</p>
					</div>
				) : (
					<Table className="min-w-[50rem]">
						<TableHeader>
							<TableRow>
								<TableHead>
									<Link
										href={sortHref("date")}
										className="inline-flex items-center gap-1"
									>
										Date{" "}
										<SortIndicator
											field="date"
											sortField={sortField}
											sortDir={sortDir}
										/>
									</Link>
								</TableHead>
								<TableHead>
									<Link
										href={sortHref("description")}
										className="inline-flex items-center gap-1"
									>
										Description{" "}
										<SortIndicator
											field="description"
											sortField={sortField}
											sortDir={sortDir}
										/>
									</Link>
								</TableHead>
								<TableHead>
									<Link
										href={sortHref("category")}
										className="inline-flex items-center gap-1"
									>
										Category{" "}
										<SortIndicator
											field="category"
											sortField={sortField}
											sortDir={sortDir}
										/>
									</Link>
								</TableHead>
								<TableHead>
									<Link
										href={sortHref("amount")}
										className="inline-flex items-center gap-1"
									>
										Amount{" "}
										<SortIndicator
											field="amount"
											sortField={sortField}
											sortDir={sortDir}
										/>
									</Link>
								</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{expenses.map((e) => (
								<TableRow key={e.id}>
									<TableCell className="whitespace-nowrap text-(--card-text-muted)">
										{formatDate(e.date)}
									</TableCell>
									<TableCell className="max-w-xs break-words">
										<span className="font-medium">{e.description}</span>
										{e.note ? (
											<p className="mt-0.5 text-xs text-(--card-text-muted)">
												{e.note}
											</p>
										) : null}
									</TableCell>
									<TableCell>
										<Badge variant="default">{e.category.name}</Badge>
									</TableCell>
									<TableCell className="whitespace-nowrap font-semibold tabular-nums">
										{formatCurrency(e.amount)}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex flex-wrap items-center justify-end gap-2">
											<form action={deleteExpense}>
												<input type="hidden" name="id" value={e.id} />
												<Button
													type="submit"
													size="sm"
													variant="danger"
													icon={<Trash2 />}
												>
													Delete
												</Button>
											</form>
											<EditExpenseDialog
												expense={{
													id: e.id,
													description: e.description,
													amount: Number(e.amount),
													date: e.date.toISOString(),
													categoryId: e.categoryId,
													note: e.note,
												}}
												categories={categoryOptions}
											/>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}

				{totalPages > 1 ? (
					<div className="flex items-center justify-between gap-4 sm:justify-start">
						{page > 1 ? (
							<Button href={href(page - 1)} size="sm" icon={<ChevronLeft />}>
								Previous
							</Button>
						) : (
							<Button disabled size="sm" icon={<ChevronLeft />}>
								Previous
							</Button>
						)}
						<span className="text-sm text-(--card-text-muted)">
							Page {page} of {totalPages}
						</span>
						{page < totalPages ? (
							<Button href={href(page + 1)} size="sm" icon={<ChevronRight />}>
								Next
							</Button>
						) : (
							<Button disabled size="sm" icon={<ChevronRight />}>
								Next
							</Button>
						)}
					</div>
				) : null}
			</main>
		</div>
	);
}
