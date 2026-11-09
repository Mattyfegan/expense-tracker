import { Skeleton } from "@expense-tracker/ui";
import AppNav from "./_components/AppNav.js";

export default function Loading() {
	return (
		<div>
			<AppNav />
			<main
				className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6"
				aria-busy="true"
				aria-label="Loading dashboard"
			>
				<div className="space-y-3">
					<Skeleton className="h-3 w-28" />
					<Skeleton className="h-9 w-44" />
					<Skeleton className="h-4 w-64" />
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
				</div>
				<div className="grid gap-8 lg:grid-cols-2">
					<Skeleton className="h-80" />
					<Skeleton className="h-80" />
				</div>
			</main>
		</div>
	);
}
