"use client";

import { useEffect, useRef, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const HEIGHT = 256;

function formatAmount(value) {
	return `$${Number(value).toLocaleString()}`;
}

export default function SpendingChart({ data }) {
	const containerRef = useRef(null);
	const [width, setWidth] = useState(0);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const update = () => setWidth(el.getBoundingClientRect().width);
		update();

		const observer = new ResizeObserver(update);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={containerRef} className="h-64 w-full">
			{width > 0 ? (
				<AreaChart
					width={width}
					height={HEIGHT}
					data={data}
					margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
				>
					<defs>
						<linearGradient id="spending-fill" x1="0" y1="0" x2="0" y2="1">
							<stop
								offset="0%"
								stopColor="var(--color-primary)"
								stopOpacity={0.25}
							/>
							<stop
								offset="100%"
								stopColor="var(--color-primary)"
								stopOpacity={0}
							/>
						</linearGradient>
					</defs>

					<CartesianGrid
						strokeDasharray="3 3"
						vertical={false}
						stroke="var(--color-border)"
					/>

					<XAxis
						dataKey="label"
						tickLine={false}
						axisLine={false}
						tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
					/>

					<YAxis
						tickLine={false}
						axisLine={false}
						width={56}
						tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
						tickFormatter={formatAmount}
					/>

					<Tooltip
						trigger="hover"
						cursor={{
							stroke: "var(--color-border)",
							strokeDasharray: "3 3",
						}}
						formatter={(value) => [formatAmount(value), "Spent"]}
						contentStyle={{
							backgroundColor: "var(--color-surface)",
							border: "1px solid var(--color-border)",
							borderRadius: "var(--radius-default)",
							fontSize: "12px",
						}}
						labelStyle={{ color: "var(--color-text-muted)" }}
						itemStyle={{ color: "var(--color-text)" }}
					/>

					<Area
						type="monotone"
						dataKey="total"
						stroke="var(--color-primary)"
						strokeWidth={2.5}
						fill="url(#spending-fill)"
						dot={{ r: 3, fill: "var(--color-primary)", strokeWidth: 0 }}
						activeDot={{ r: 5 }}
					/>
				</AreaChart>
			) : null}
		</div>
	);
}
