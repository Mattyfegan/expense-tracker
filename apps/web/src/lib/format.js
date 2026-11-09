const currency = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

export function formatCurrency(amount) {
	return currency.format(Number(amount ?? 0));
}

export function formatDate(date) {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	});
}
