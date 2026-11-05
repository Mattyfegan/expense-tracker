import { category, expense } from "@expense-tracker/db";
import {
	Button,
	Input,
	Select,
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
	ChevronsUpDown,
	Pencil,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import AppNav from "../_components/AppNav.js";
import AddExpenseDialog from "./AddExpenseDialog.js";
import { deleteExpense, updateExpense } from "./actions.js";
import Filters from "./Filters.js";

export const dynamic = "force-dynamic";

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
			<main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold">Expenses</h1>
					<AddExpenseDialog categories={categoryOptions} />
				</div>

				<Filters categories={categoryOptions} q={q} categoryId={categoryId} />

				{expenses.length === 0 ? (
					<p className="text-sm text-(--card-text-muted)">No expenses found.</p>
				) : (
					<Table>
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
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{expenses.map((e) => (
								<TableRow key={e.id}>
									<TableCell>{formatDate(e.date)}</TableCell>
									<TableCell className="break-words">
										{e.description}
										{e.note ? (
											<span className="text-(--card-text-muted)">
												{" "}
												· {e.note}
											</span>
										) : null}
									</TableCell>
									<TableCell>{e.category.name}</TableCell>
									<TableCell>{formatCurrency(e.amount)}</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
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
											<details>
												<summary className="inline-flex h-8 cursor-pointer list-none items-center gap-2 rounded-(--radius-default) border border-(--color-primary) px-3 text-sm font-medium text-(--color-primary) transition-colors hover:bg-(--color-primary-muted) [&::-webkit-details-marker]:hidden">
													<Pencil className="h-4 w-4" />
													Edit
												</summary>
												<form action={updateExpense} className="space-y-2 py-2">
													<input type="hidden" name="id" value={e.id} />
													<Input
														name="description"
														defaultValue={e.description}
														required
													/>
													<Input
														name="amount"
														type="number"
														step="0.01"
														min="0"
														defaultValue={Number(e.amount)}
														required
													/>
													<Input
														name="date"
														type="date"
														defaultValue={e.date.toISOString().slice(0, 10)}
														required
													/>
													<Select name="categoryId" defaultValue={e.categoryId}>
														{categories.map((c) => (
															<option key={c.id} value={c.id}>
																{c.name}
															</option>
														))}
													</Select>
													<Input name="note" defaultValue={e.note ?? ""} />
													<Button type="submit" size="sm" variant="primary">
														Save
													</Button>
												</form>
											</details>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}

				{totalPages > 1 ? (
					<div className="flex items-center gap-4">
						{page > 1 ? (
							<Button href={href(page - 1)}>Previous</Button>
						) : (
							<Button disabled>Previous</Button>
						)}
						<span className="text-sm text-(--card-text-muted)">
							Page {page} of {totalPages}
						</span>
						{page < totalPages ? (
							<Button href={href(page + 1)}>Next</Button>
						) : (
							<Button disabled>Next</Button>
						)}
					</div>
				) : null}
			</main>
		</div>
	);
}
