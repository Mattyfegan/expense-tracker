import { category, expense } from "@expense-tracker/db";
import AppNav from "../_components/AppNav.js";
import { deleteExpense, updateExpense } from "./actions.js";
import ExpenseForm from "./ExpenseForm.js";

function formatDate(date) {
	return date.toISOString().slice(0, 10);
}

function formatAmount(amount) {
	return Number(amount).toFixed(2);
}

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
	const [expenses, categories] = await Promise.all([
		expense.findAll({ take: 100 }),
		category.findAll(),
	]);

	const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));

	return (
		<main>
			<AppNav />
			<h1>Expenses</h1>

			<ExpenseForm categories={categoryOptions} />

			{expenses.length === 0 ? (
				<p>No expenses yet. Add your first one above.</p>
			) : (
				<ul>
					{expenses.map((e) => (
						<li key={e.id}>
							<strong>{e.description}</strong> — ${formatAmount(e.amount)} on{" "}
							{formatDate(e.date)} ({e.category.name})
							{e.note ? <span> · {e.note}</span> : null}
							<form action={deleteExpense} style={{ display: "inline" }}>
								<input type="hidden" name="id" value={e.id} />
								<button type="submit">Delete</button>
							</form>
							<details>
								<summary>Edit</summary>
								<form action={updateExpense}>
									<input type="hidden" name="id" value={e.id} />
									<input
										name="description"
										defaultValue={e.description}
										required
									/>
									<input
										name="amount"
										type="number"
										step="0.01"
										min="0"
										defaultValue={Number(e.amount)}
										required
									/>
									<input
										name="date"
										type="date"
										defaultValue={formatDate(e.date)}
										required
									/>
									<select name="categoryId" defaultValue={e.categoryId}>
										{categoryOptions.map((c) => (
											<option key={c.id} value={c.id}>
												{c.name}
											</option>
										))}
									</select>
									<input name="note" defaultValue={e.note ?? ""} />
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
