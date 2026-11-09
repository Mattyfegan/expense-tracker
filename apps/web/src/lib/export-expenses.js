import { expense } from "@expense-tracker/db";

const orderByMap = {
	date: (dir) => ({ date: dir }),
	description: (dir) => ({ description: dir }),
	amount: (dir) => ({ amount: dir }),
	category: (dir) => ({ category: { name: dir } }),
};

export function buildExpenseOrderBy(sort, dir = "desc") {
	const factory = orderByMap[sort];
	return factory ? factory(dir) : { date: dir };
}

export function expensesToCsv(expenses) {
	const header = ["Date", "Description", "Amount", "Category", "Note"];
	const rows = expenses.map((e) => [
		new Date(e.date).toISOString().slice(0, 10),
		e.description ?? "",
		Number(e.amount ?? 0).toFixed(2),
		e.category?.name ?? "",
		e.note ?? "",
	]);
	return [header, ...rows]
		.map((row) =>
			row
				.map((value) => {
					const str = String(value ?? "");
					if (/[",\n\r]/.test(str)) {
						return `"${str.replace(/"/g, '""')}"`;
					}
					return str;
				})
				.join(","),
		)
		.join("\r\n")
		.concat("\r\n");
}

export const toCsv = expensesToCsv;
export const exportExpensesToCsv = expensesToCsv;

export async function getExpensesCsv(options = {}) {
	const { q, categoryId, sort = "date", dir = "desc" } = options;
	const orderBy = buildExpenseOrderBy(sort, dir);
	const expenses = await expense.findAll({
		q,
		categoryId,
		orderBy,
		take: 100000,
	});
	return expensesToCsv(expenses);
}
