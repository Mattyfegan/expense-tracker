import { category } from "@expense-tracker/db";
import {
	Button,
	Input,
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
import AppNav from "../_components/AppNav.js";
import AddCategoryDialog from "./AddCategoryDialog.js";
import { deleteCategory, updateCategory } from "./actions.js";

export const dynamic = "force-dynamic";

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

	const categories = await category.findAll({ take: 100, orderBy });

	function sortHref(field) {
		const nextDir = sortField === field && sortDir === "asc" ? "desc" : "asc";
		return `/categories?sort=${field}&dir=${nextDir}`;
	}

	return (
		<div>
			<AppNav />
			<main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold">Categories</h1>
					<AddCategoryDialog />
				</div>

				{categories.length === 0 ? (
					<p className="text-sm text-(--card-text-muted)">No categories yet.</p>
				) : (
					<Table>
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
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{categories.map((c) => (
								<TableRow key={c.id}>
									<TableCell className="break-words">
										{c.name}
										{c.description ? (
											<p className="text-xs text-(--card-text-muted)">
												{c.description}
											</p>
										) : null}
									</TableCell>
									<TableCell>{c._count.expenses}</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
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
											<details>
												<summary className="inline-flex h-8 cursor-pointer list-none items-center gap-2 rounded-(--radius-default) border border-(--color-primary) px-3 text-sm font-medium text-(--color-primary) transition-colors hover:bg-(--color-primary-muted) [&::-webkit-details-marker]:hidden">
													<Pencil className="h-4 w-4" />
													Rename
												</summary>
												<form
													action={updateCategory}
													className="space-y-2 py-2"
												>
													<input type="hidden" name="id" value={c.id} />
													<Input name="name" defaultValue={c.name} required />
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
			</main>
		</div>
	);
}
