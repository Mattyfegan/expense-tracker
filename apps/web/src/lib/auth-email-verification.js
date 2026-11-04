import { loadConfig } from "@expense-tracker/config";

export function isEmailVerificationRequired() {
	return loadConfig().auth.requireEmailVerification;
}
