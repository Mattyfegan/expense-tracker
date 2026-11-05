import { Skeleton } from "@expense-tracker/ui";

export default function Loading() {
	return (
		<div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
			<Skeleton className="h-8 w-40" />
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<Skeleton className="h-24" />
				<Skeleton className="h-24" />
				<Skeleton className="h-24" />
				<Skeleton className="h-24" />
			</div>
			<div className="grid gap-8 lg:grid-cols-2">
				<Skeleton className="h-48" />
				<Skeleton className="h-48" />
			</div>
		</div>
	);
}
