import Link from "next/link.js";
import React from "react";
import { Spinner } from "./spinner.js";

const base =
	"inline-flex items-center justify-center whitespace-nowrap font-semibold tracking-tight transition-all duration-200 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] active:opacity-90";

const variantCls =
	"bg-(--btn-bg) border border-(--btn-border) text-(--btn-text) rounded-(--btn-radius) hover:brightness-[var(--btn-hover-brightness)] hover:shadow-[var(--btn-hover-shadow)] hover:bg-[var(--btn-hover-bg)] hover:text-[var(--btn-hover-text)] hover:opacity-[var(--btn-hover-opacity)] focus-visible:ring-[var(--btn-ring)]";

const sizes = {
	sm: "h-9 px-3 text-xs",
	md: "h-10 px-4 text-sm",
	lg: "h-12 px-6 text-base",
};

const iconSizes = {
	sm: "var(--btn-icon-sm)",
	md: "var(--btn-icon-md)",
	lg: "var(--btn-icon-lg)",
};

function buildIcon(icon, size) {
	if (!icon) return null;

	const iconSize = iconSizes[size] ?? iconSizes.md;
	const iconStyle = { width: iconSize, height: iconSize, flexShrink: 0 };

	if (React.isValidElement(icon)) {
		const existingClassName = icon.props.className ?? "";
		return React.cloneElement(icon, {
			"aria-hidden": true,
			focusable: false,
			className: `${existingClassName}`.trim(),
			style: { ...iconStyle, ...icon.props.style },
		});
	}

	return React.createElement(
		"span",
		{
			"aria-hidden": true,
			style: iconStyle,
		},
		icon,
	);
}

export function Button({
	variant = "default",
	size = "md",
	className = "",
	href,
	target,
	rel,
	type = "button",
	icon,
	loading = false,
	children,
	...props
}) {
	const hasLabel =
		children !== null && children !== undefined && children !== false;
	const hasIcon = Boolean(icon);
	const spacing = hasIcon && hasLabel ? "gap-2" : "";
	const cls =
		`${base} ${variantCls} ${sizes[size] ?? sizes.md} ${spacing} ${className}`.trim();
	const buttonType =
		type === "submit" || type === "reset" || type === "button"
			? type
			: "button";

	const buttonChildren = [];

	if (loading)
		buttonChildren.push(
			React.createElement(Spinner, { key: "spinner", className: "h-4 w-4" }),
		);
	if (hasIcon && !loading) buttonChildren.push(buildIcon(icon, size));
	if (hasLabel) buttonChildren.push(children);

	if (href) {
		const anchorRel =
			target === "_blank" ? (rel ?? "noopener noreferrer") : rel;
		return React.createElement(
			Link,
			{
				href: loading ? undefined : href,
				target,
				rel: anchorRel,
				className: cls,
				"data-btn-variant": variant,
				"aria-disabled": loading || undefined,
				"aria-busy": loading || undefined,
				...props,
			},
			...buttonChildren,
		);
	}

	return React.createElement(
		"button",
		{
			type: buttonType,
			className: cls,
			"data-btn-variant": variant,
			"aria-busy": loading || undefined,
			disabled: loading || props.disabled,
			...props,
		},
		...buttonChildren,
	);
}
