import { createLogger } from "@usequark/quark-core/core";
import { getExpensesCsv } from "@/lib/export-expenses";
import { handleError } from "../../error-handler";

const log = createLogger("expenses:export");

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const q = searchParams.get("q") || undefined;
		const categoryId = searchParams.get("categoryId") || undefined;
		const sort = searchParams.get("sort") || "date";
		const dir = searchParams.get("dir") === "asc" ? "asc" : "desc";

		const csv = await getExpensesCsv({ q, categoryId, sort, dir });
		log.info("exported expenses", { bytes: csv.length });

		return new Response(csv, {
			status: 200,
			headers: {
				"Content-Type": "text/csv; charset=utf-8",
				"Content-Disposition": 'attachment; filename="expenses.csv"',
				"Cache-Control": "no-store",
			},
		});
	} catch (error) {
		return handleError(error);
	}
}
