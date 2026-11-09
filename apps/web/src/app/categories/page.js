import { category } from "@expense-tracker/db";
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
import { ArrowDown, ArrowUp, ChevronsUpDown, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import AppNav from "../_components/AppNav.js";
import AddCategoryDialog from "./AddCategoryDialog.js";
import { deleteCategory } from "./actions.js";
import EditCategoryDialog from "./EditCategoryDialog.js";

export const dynamic = "force-dynamic";
export const metadata = { title: { absolute: "Categories" } };

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

export default async function CategoriesPage({ searchParams }) {
	const params = await searchParams;
	const sortField = typeof params.sort === "string" ? params.sort : "name";
	const sortDir = params.dir === "asc" ? "asc" : "desc";

	const orderBy = {
		name: { name: sortDir },
		expenses: { expenses: { _count: sortDir } },
	}[sortField] ?? { name: sortDir };

	const categories = await category.findAllWithExpenseTotals({
		take: 100,
		orderBy: sortField === "total" ? { name: "asc" } : orderBy,
	});

	if (sortField === "total") {
		categories.sort((a, b) => {
			const difference = Number(a.expenseTotal) - Number(b.expenseTotal);
			return difference === 0
				? a.name.localeCompare(b.name)
				: difference * (sortDir === "asc" ? 1 : -1);
		});
	}

	function sortHref(field) {
		const nextDir = sortField === field && sortDir === "asc" ? "desc" : "asc";
		return `/categories?sort=${field}&dir=${nextDir}`;
	}

	return (
		<div>
			<AppNav />
			<main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-primary)">
							Organize spending
						</p>
						<h1 className="mt-2 text-3xl font-bold tracking-tight">
							Categories
						</h1>
						<p className="mt-1 text-sm text-(--card-text-muted)">
							Keep your expense list tidy with simple, reusable labels.
						</p>
					</div>
					<AddCategoryDialog />
				</div>

				{categories.length === 0 ? (
					<div className="rounded-xl border border-dashed border-(--card-border) bg-(--card-bg) px-6 py-12 text-center">
						<p className="font-semibold">No categories yet</p>
						<p className="mt-1 text-sm text-(--card-text-muted)">
							Create a category to start organizing your expenses.
						</p>
					</div>
				) : (
					<Table className="min-w-[42rem]">
						<TableHeader>
							<TableRow>
								<TableHead>
									<Link
										href={sortHref("name")}
										className="inline-flex items-center gap-1"
									>
										Name{" "}
										<SortIndicator
											field="name"
											sortField={sortField}
											sortDir={sortDir}
										/>
									</Link>
								</TableHead>
								<TableHead>
									<Link
										href={sortHref("expenses")}
										className="inline-flex items-center gap-1"
									>
										Expenses{" "}
										<SortIndicator
											field="expenses"
											sortField={sortField}
											sortDir={sortDir}
										/>
									</Link>
								</TableHead>
								<TableHead>
									<Link
										href={sortHref("total")}
										className="inline-flex items-center gap-1"
									>
										Total spent{" "}
										<SortIndicator
											field="total"
											sortField={sortField}
											sortDir={sortDir}
										/>
									</Link>
								</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{categories.map((c) => (
								<TableRow key={c.id}>
									<TableCell className="max-w-xl break-words">
										<p className="font-semibold">{c.name}</p>
										{c.description ? (
											<p className="text-xs text-(--card-text-muted)">
												{c.description}
											</p>
										) : null}
									</TableCell>
									<TableCell>
										<Badge variant="primary">
											{c._count.expenses}{" "}
											{c._count.expenses === 1 ? "expense" : "expenses"}
										</Badge>
									</TableCell>
									<TableCell className="whitespace-nowrap font-semibold tabular-nums">
										{formatCurrency(c.expenseTotal)}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex flex-wrap items-center justify-end gap-2">
											<form action={deleteCategory}>
												<input type="hidden" name="id" value={c.id} />
												<Button
													type="submit"
													size="sm"
													variant="danger"
													icon={<Trash2 />}
												>
													Delete
												</Button>
											</form>
											<EditCategoryDialog
												category={{ id: c.id, name: c.name }}
											/>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</main>
		</div>
	);
}
