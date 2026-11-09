import { Skeleton } from "@expense-tracker/ui";
import AppNav from "../_components/AppNav.js";

const headerKeys = ["name", "expenses", "actions"];
const rowKeys = ["row-1", "row-2", "row-3", "row-4", "row-5", "row-6"];

export default function Loading() {
	return (
		<div>
			<AppNav />
			<main
				className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6"
				aria-busy="true"
				aria-label="Loading categories"
			>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div className="space-y-3">
						<Skeleton className="h-3 w-32" />
						<Skeleton className="h-9 w-40" />
						<Skeleton className="h-4 w-72" />
					</div>
					<Skeleton className="h-10 w-40" />
				</div>
				<div className="overflow-hidden rounded-xl border border-(--table-border) bg-(--table-bg) shadow-[var(--table-shadow)]">
					<div className="grid grid-cols-3 gap-4 border-b border-(--table-border) bg-(--table-header-bg) p-4">
						{headerKeys.map((key) => (
							<Skeleton key={key} className="h-3" />
						))}
					</div>
					<div className="divide-y divide-(--table-border)">
						{rowKeys.map((key) => (
							<div key={key} className="grid grid-cols-3 gap-4 p-4">
								<Skeleton className="h-10" />
								<Skeleton className="h-8 w-28" />
								<Skeleton className="ml-auto h-8 w-28" />
							</div>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}
