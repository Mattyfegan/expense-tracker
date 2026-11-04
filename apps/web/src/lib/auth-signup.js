import { loadConfig } from "@expense-tracker/config";

export function isSignupEnabled() {
	return loadConfig().auth.allowSignup;
}
