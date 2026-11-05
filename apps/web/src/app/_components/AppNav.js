import { Navbar } from "@expense-tracker/ui";

const links = [
	{ label: "Dashboard", href: "/" },
	{ label: "Expenses", href: "/expenses" },
	{ label: "Categories", href: "/categories" },
];

export default function AppNav() {
	return (
		<Navbar
			logo={
				<span className="flex items-center gap-2.5">
					{/* biome-ignore lint/performance/noImgElement: static logo; next/image causes a hydration mismatch here */}
					<img src="/logo.png" alt="Coinflow" className="h-16 w-16" />
					<span className="text-2xl">Coinflow</span>
				</span>
			}
			logoHref="/"
			links={links}
			action={null}
		/>
	);
}
