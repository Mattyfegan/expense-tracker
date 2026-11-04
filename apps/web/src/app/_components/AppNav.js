import Link from "next/link";

export default function AppNav() {
	return (
		<nav>
			<Link href="/dashboard">Dashboard</Link> |{" "}
			<Link href="/expenses">Expenses</Link> |{" "}
			<Link href="/categories">Categories</Link>
		</nav>
	);
}
