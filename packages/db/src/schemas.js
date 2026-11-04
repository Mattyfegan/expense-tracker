import { z } from "zod";

export const userCreateSchema = z.object({
	email: z.string().email(),
	name: z.string().optional(),
	image: z.string().url().optional(),
});

/**
 * Password rules, shared by every route that sets one.
 *
 * Registration and password reset must not drift: a reset that accepts a weaker
 * password than signup would let a user downgrade their own credential, and the
 * reverse would lock a legitimate password out of recovery. Composed into
 * `userRegisterSchema` rather than duplicated, so there is one definition.
 */
export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number");

export const userRegisterSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: passwordSchema,
	name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

export const userUpdateSchema = z.object({
	email: z.string().email().optional(),
	name: z.string().optional(),
	image: z.string().url().optional(),
});

export const fileUploadSchema = z.object({
	filename: z.string().min(1, "Filename is required"),
	mimeType: z.string().min(1, "MIME type is required"),
	size: z.number().int().positive("File size must be positive"),
});

export const categorySchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Name is required")
		.max(50, "Name must be 50 characters or fewer"),
});

function isFutureDate(value) {
	const now = new Date();
	const entered = Date.UTC(
		value.getUTCFullYear(),
		value.getUTCMonth(),
		value.getUTCDate(),
	);
	const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
	return entered > today;
}

export const expenseSchema = z.object({
	description: z
		.string()
		.trim()
		.min(1, "Description is required")
		.max(255, "Description must be 255 characters or fewer"),
	amount: z
		.string()
		.trim()
		.regex(
			/^\d+(\.\d{1,2})?$/,
			"Amount must be a number with at most 2 decimal places",
		)
		.refine((value) => Number(value) > 0, "Amount must be a positive number")
		.refine(
			(value) => Number(value) <= 99999999.99,
			"Amount is too large (max 99,999,999.99)",
		),
	date: z.coerce
		.date({ error: "Date is required" })
		.refine((value) => !isFutureDate(value), {
			message: "Date cannot be in the future",
		}),
	note: z
		.string()
		.trim()
		.max(1000, "Note must be 1000 characters or fewer")
		.optional(),
	categoryId: z.string().min(1, "Category is required"),
});
