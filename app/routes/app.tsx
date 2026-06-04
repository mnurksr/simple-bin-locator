import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError, Link } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

import { authenticate } from "../shopify.server";
import db from "../db.server";
import { getT } from "../locales";

import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import enTranslations from "@shopify/polaris/locales/en.json";
import trTranslations from "@shopify/polaris/locales/tr.json";
import esTranslations from "@shopify/polaris/locales/es.json";
import frTranslations from "@shopify/polaris/locales/fr.json";
import deTranslations from "@shopify/polaris/locales/de.json";
import { redirect } from "react-router";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const locale = new URL(request.url).searchParams.get("locale") || "en";

  const settings = await db.appSettings.findUnique({
    where: { shop: session.shop }
  });
  
  const isConfigured = !!settings;
  const pathname = new URL(request.url).pathname;

  if (!isConfigured && !pathname.endsWith("/settings")) {
    const url = new URL(request.url);
    throw redirect(`/app/settings?${url.searchParams.toString()}`);
  }

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "", locale, isConfigured };
};

export default function App() {
  const { apiKey, locale, isConfigured } = useLoaderData<typeof loader>();
  
  // Custom translation function
  const t = getT(locale);
  
  // Select translation based on Shopify locale
  let translations = enTranslations;
  if (locale.startsWith("tr")) translations = trTranslations;
  else if (locale.startsWith("es")) translations = esTranslations;
  else if (locale.startsWith("fr")) translations = frTranslations;
  else if (locale.startsWith("de")) translations = deTranslations;

  return (
    <AppProvider embedded apiKey={apiKey}>
      <PolarisAppProvider i18n={translations}>
        <ui-nav-menu>
          {isConfigured && (
            <>
              <Link to="/app" rel="home">
                {t("nav.home")}
              </Link>
              <Link to="/app/bins">{t("nav.bins")}</Link>
            </>
          )}
          <Link to="/app/settings">{t("nav.settings")}</Link>
        </ui-nav-menu>
        <Outlet context={{ t, locale }} />
      </PolarisAppProvider>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
