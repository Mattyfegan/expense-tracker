import { category } from "@expense-tracker/db";
import AppNav from "../_components/AppNav.js";
import { deleteCategory, updateCategory } from "./actions.js";
import CategoryForm from "./CategoryForm.js";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
	const categories = await category.findAll();

	return (
		<main>
			<AppNav />
			<h1>Categories</h1>

			<CategoryForm />

			{categories.length === 0 ? (
				<p>No categories yet. Add your first one above.</p>
			) : (
				<ul>
					{categories.map((c) => (
						<li key={c.id}>
							{c.name} ({c._count.expenses} expenses)
							<form action={deleteCategory} style={{ display: "inline" }}>
								<input type="hidden" name="id" value={c.id} />
								<button type="submit">Delete</button>
							</form>
							<details>
								<summary>Rename</summary>
								<form action={updateCategory}>
									<input type="hidden" name="id" value={c.id} />
									<input name="name" defaultValue={c.name} required />
									<button type="submit">Save</button>
								</form>
							</details>
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
