import { getAppUrl } from "@expense-tracker/config";
import { isWebsiteIndexable } from "../lib/seo/indexing.js";
import {
	buildSitemapEntries,
	STATIC_SITEMAP_ROUTES,
} from "../lib/sitemap-entries.js";

export const revalidate = 3600;

export default async function sitemap() {
	if (!isWebsiteIndexable()) {
		return [];
	}

	const appUrl = getAppUrl();
	return buildSitemapEntries({ appUrl });
}
