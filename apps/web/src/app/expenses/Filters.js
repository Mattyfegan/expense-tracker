"use client";

import { Button, Input, Label, Select } from "@expense-tracker/ui";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function buildUrl(nextSearch, nextCategoryId) {
	const params = new URLSearchParams();
	if (nextSearch) params.set("q", nextSearch);
	if (nextCategoryId) params.set("categoryId", nextCategoryId);
	const qs = params.toString();
	return qs ? `/expenses?${qs}` : "/expenses";
}

export default function Filters({
	categories,
	q: initialQ,
	categoryId: initialCategoryId,
}) {
	const router = useRouter();
	const [search, setSearch] = useState(initialQ ?? "");
	const firstRender = useRef(true);

	useEffect(() => {
		if (firstRender.current) {
			firstRender.current = false;
			return;
		}
		const t = setTimeout(() => {
			router.replace(buildUrl(search, initialCategoryId), { scroll: false });
		}, 300);
		return () => clearTimeout(t);
	}, [search, initialCategoryId, router]);

	function handleCategoryChange(event) {
		const value = event?.target?.value ?? "";
		router.replace(buildUrl(search, value), { scroll: false });
	}

	function clearFilters() {
		setSearch("");
		router.replace("/expenses", { scroll: false });
	}

	return (
		<div className="flex items-end gap-3">
			<div className="flex-1 space-y-1.5">
				<Label htmlFor="search">Search</Label>
				<Input
					id="search"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search description or note"
				/>
			</div>
			<div className="w-64 space-y-1.5">
				<Label>Category</Label>
				<Select value={initialCategoryId ?? ""} onChange={handleCategoryChange}>
					<option value="">All categories</option>
					{categories.map((c) => (
						<option key={c.id} value={c.id}>
							{c.name}
						</option>
					))}
				</Select>
			</div>
			{initialQ || initialCategoryId ? (
				<Button size="sm" variant="ghost" onClick={clearFilters}>
					Clear
				</Button>
			) : null}
		</div>
	);
}
