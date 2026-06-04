import { useEffect } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData, useFetcher, useOutletContext } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import db from "../db.server";

/** Loader: fetch recent processed orders + app settings for dashboard */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const recentOrders = await db.processedOrder.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const settings = await db.appSettings.findUnique({
    where: { shop },
  });

  const totalProcessed = await db.processedOrder.count({
    where: { shop },
  });

  const totalSuccess = await db.processedOrder.count({
    where: { shop, status: "success" },
  });

  const totalFailed = await db.processedOrder.count({
    where: { shop, status: "failed" },
  });

  const totalSkipped = await db.processedOrder.count({
    where: { shop, status: "skipped" },
  });

  return {
    recentOrders: recentOrders.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
    })),
    settings,
    stats: { totalProcessed, totalSuccess, totalFailed, totalSkipped },
    isActive: settings?.isActive ?? true,
  };
};

/** Action: toggle app active state */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;

  if (actionType === "toggle") {
    const currentSettings = await db.appSettings.findUnique({
      where: { shop },
    });

    await db.appSettings.upsert({
      where: { shop },
      update: { isActive: !currentSettings?.isActive },
      create: { shop, isActive: false },
    });

    return { success: true, action: "toggle" };
  }

  return { success: false };
};

export default function Dashboard() {
  const { recentOrders, stats, isActive, settings } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const { t, locale } = useOutletContext<any>();

  const isToggling =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("actionType") === "toggle";

  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.action === "toggle") {
      shopify.toast.show(
        isActive ? t("dashboard.status.paused") : t("dashboard.status.active")
      );
    }
  }, [fetcher.data, isActive, shopify, t]);

  const toggleApp = () => {
    fetcher.submit({ actionType: "toggle" }, { method: "POST" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return "success" as const;
      case "failed":
        return "critical" as const;
      case "skipped":
        return "warning" as const;
      default:
        return "info" as const;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "success":
        return t("dashboard.stats.success");
      case "failed":
        return t("dashboard.stats.error");
      case "skipped":
        return t("dashboard.stats.skipped");
      case "pending":
        return t("dashboard.orders.status.pending");
      default:
        return status;
    }
  };

  return (
    <s-page heading="Simple Bin Locations">
      <s-button
        slot="primary-action"
        variant={isActive ? "secondary" : "primary"}
        onClick={toggleApp}
        {...(isToggling ? { loading: true } : {})}
      >
        {isActive ? t("dashboard.toggle.stop") : t("dashboard.toggle.start")}
      </s-button>

      {/* Status Banner */}
      <s-section>
        <s-box
          padding="base"
          borderWidth="base"
          borderRadius="large"
        >
          <s-stack direction="inline" gap="base">
            <s-text>
              <span style={{ fontWeight: 600 }}>
                {isActive
                  ? t("dashboard.status.active")
                  : t("dashboard.status.paused")}
              </span>
            </s-text>
          </s-stack>
          <s-text>
            {isActive
              ? t("dashboard.status.active.desc")
              : t("dashboard.status.paused.desc")}
          </s-text>
        </s-box>
      </s-section>

      {/* Stats Cards */}
      <s-section heading={t("dashboard.stats.title")}>
        <s-stack direction="inline" gap="base">
          <s-box padding="base" borderWidth="base" borderRadius="base" minInlineSize="200px">
            <s-text><span style={{ fontSize: "12px" }}>{t("dashboard.stats.total")}</span></s-text>
            <s-heading>{stats.totalProcessed}</s-heading>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base" minInlineSize="200px">
            <s-text><span style={{ fontSize: "12px" }}>{t("dashboard.stats.success")}</span></s-text>
            <s-heading>{stats.totalSuccess}</s-heading>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base" minInlineSize="200px">
            <s-text><span style={{ fontSize: "12px" }}>{t("dashboard.stats.error")}</span></s-text>
            <s-heading>{stats.totalFailed}</s-heading>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base" minInlineSize="200px">
            <s-text><span style={{ fontSize: "12px" }}>{t("dashboard.stats.skipped")}</span></s-text>
            <s-heading>{stats.totalSkipped}</s-heading>
          </s-box>
        </s-stack>
      </s-section>

      {/* Configuration Info */}
      <s-section slot="aside" heading={t("dashboard.config.title")}>
        <s-stack direction="block" gap="base">
          <s-text>
            Metafield Namespace:{" "}
            <strong>{settings?.metafieldNamespace ?? "warehouse"}</strong>
          </s-text>
          <s-text>
            Metafield Key:{" "}
            <strong>{settings?.metafieldKey ?? "bin_location"}</strong>
          </s-text>
          <s-text>
            Note Prefix:{" "}
            <strong>{settings?.notePrefix ?? "📦 BIN LOCATIONS:"}</strong>
          </s-text>
        </s-stack>
        <s-box paddingBlockStart="base">
          <s-button href="/app/settings" variant="tertiary">
            {t("dashboard.config.edit")}
          </s-button>
        </s-box>
      </s-section>

      {/* How it works */}
      <s-section slot="aside" heading={t("dashboard.how.title")}>
        <s-ordered-list>
          <s-list-item>{t("dashboard.how.1")}</s-list-item>
          <s-list-item>{t("dashboard.how.2")}</s-list-item>
          <s-list-item>{t("dashboard.how.3")}</s-list-item>
          <s-list-item>{t("dashboard.how.4")}</s-list-item>
        </s-ordered-list>
      </s-section>

      {/* Recent Orders */}
      <s-section heading={t("dashboard.orders.title")}>
        {recentOrders.length === 0 ? (
          <s-box padding="large" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading>{t("dashboard.orders.empty.title")}</s-heading>
              <s-text>
                {t("dashboard.orders.empty.desc")}
              </s-text>
            </s-stack>
          </s-box>
        ) : (
          <s-box borderWidth="base" borderRadius="base" overflow="hidden">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--p-color-border)",
                    background: "var(--p-color-bg-surface-secondary)",
                  }}
                >
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>
                    {t("dashboard.orders.col.order")}
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>
                    {t("dashboard.orders.col.status")}
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>
                    {t("dashboard.orders.col.bins")}
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>
                    {t("dashboard.orders.col.date")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    style={{
                      borderBottom: "1px solid var(--p-color-border)",
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <strong>{order.orderName || order.orderId}</strong>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <s-badge tone={getStatusBadge(order.status)}>
                        {getStatusLabel(order.status)}
                      </s-badge>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <s-text>
                        {order.binLocations
                          ? order.binLocations.substring(0, 60) +
                            (order.binLocations.length > 60 ? "..." : "")
                          : "—"}
                      </s-text>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <s-text>
                        {new Date(order.createdAt).toLocaleDateString(locale || "en-US", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </s-text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </s-box>
        )}
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
