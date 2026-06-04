import { useEffect } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import db from "../db.server";

/** Loader: fetch current app settings */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const settings = await db.appSettings.findUnique({
    where: { shop },
  });

  return {
    settings: settings ?? {
      metafieldNamespace: "warehouse",
      metafieldKey: "bin_location",
      isActive: true,
      notePrefix: "📦 RAF KONUMLARI:",
    },
  };
};

/** Action: save settings */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const metafieldNamespace =
    (formData.get("metafieldNamespace") as string) || "warehouse";
  const metafieldKey =
    (formData.get("metafieldKey") as string) || "bin_location";
  const notePrefix =
    (formData.get("notePrefix") as string) || "📦 RAF KONUMLARI:";
  const isActive = formData.get("isActive") === "true";

  await db.appSettings.upsert({
    where: { shop },
    update: { metafieldNamespace, metafieldKey, notePrefix, isActive },
    create: { shop, metafieldNamespace, metafieldKey, notePrefix, isActive },
  });

  return { success: true };
};

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  const isSaving = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show("Ayarlar kaydedildi");
    }
  }, [fetcher.data, shopify]);

  return (
    <s-page heading="Ayarlar">
      <s-button
        slot="primary-action"
        variant="primary"
        onClick={() => {
          const form = document.getElementById(
            "settings-form"
          ) as HTMLFormElement | null;
          form?.requestSubmit();
        }}
        {...(isSaving ? { loading: true } : {})}
      >
        Kaydet
      </s-button>

      <fetcher.Form method="POST" id="settings-form">
        <input
          type="hidden"
          name="isActive"
          value={String(settings.isActive)}
        />

        <s-section heading="Metafield Yapılandırması">
          <s-paragraph>
            Ürün varyantlarınızdaki raf konumu metafield&apos;ının namespace ve
            key değerlerini girin. Bu değerler, webhook tetiklendiğinde hangi
            metafield&apos;ın okunacağını belirler.
          </s-paragraph>

          <s-stack direction="block" gap="base">
            <s-box>
              <label
                htmlFor="metafieldNamespace"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Metafield Namespace
              </label>
              <input
                id="metafieldNamespace"
                name="metafieldNamespace"
                type="text"
                defaultValue={settings.metafieldNamespace}
                placeholder="warehouse"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "14px",
                  border: "1px solid var(--p-color-border)",
                  borderRadius: "8px",
                  background: "var(--p-color-bg-surface)",
                }}
              />
              <s-text>
                <span style={{ fontSize: "12px" }}>
                  Örnek: warehouse, custom, shelf
                </span>
              </s-text>
            </s-box>

            <s-box>
              <label
                htmlFor="metafieldKey"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Metafield Key
              </label>
              <input
                id="metafieldKey"
                name="metafieldKey"
                type="text"
                defaultValue={settings.metafieldKey}
                placeholder="bin_location"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "14px",
                  border: "1px solid var(--p-color-border)",
                  borderRadius: "8px",
                  background: "var(--p-color-bg-surface)",
                }}
              />
              <s-text>
                <span style={{ fontSize: "12px" }}>
                  Örnek: bin_location, shelf_number, rack_id
                </span>
              </s-text>
            </s-box>
          </s-stack>
        </s-section>

        <s-section heading="Not Formatı">
          <s-stack direction="block" gap="base">
            <s-box>
              <label
                htmlFor="notePrefix"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Not Başlığı
              </label>
              <input
                id="notePrefix"
                name="notePrefix"
                type="text"
                defaultValue={settings.notePrefix}
                placeholder="📦 RAF KONUMLARI:"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "14px",
                  border: "1px solid var(--p-color-border)",
                  borderRadius: "8px",
                  background: "var(--p-color-bg-surface)",
                }}
              />
              <s-text>
                <span style={{ fontSize: "12px" }}>
                  Sipariş notunun başına eklenecek başlık metni
                </span>
              </s-text>
            </s-box>

            {/* Preview */}
            <s-box
              padding="base"
              borderWidth="base"
              borderRadius="base"
              background="subdued"
            >
              <s-heading>Önizleme:</s-heading>
              <pre
                style={{
                  margin: "8px 0 0 0",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >
                {settings.notePrefix || "📦 RAF KONUMLARI:"}
                {"\n"}• [SKU-001] Örnek Ürün (Kırmızı / M) → A-12-3 (x2)
                {"\n"}• [SKU-002] Başka Ürün (Mavi / L) → B-05-1 (x1)
              </pre>
            </s-box>
          </s-stack>
        </s-section>
      </fetcher.Form>

      {/* Help */}
      <s-section slot="aside" heading="Yardım">
        <s-stack direction="block" gap="base">
          <s-heading>Metafield Nedir?</s-heading>
          <s-paragraph>
            Metafield&apos;lar, Shopify ürün varyantlarına eklenen özel veri
            alanlarıdır. Raf konumlarını saklamak için her varyanta bir
            metafield atamanız gerekir.
          </s-paragraph>

          <s-heading>Nasıl Ayarlanır?</s-heading>
          <s-ordered-list>
            <s-list-item>
              Shopify Admin → Ayarlar → Özel veri → Varyantlar
            </s-list-item>
            <s-list-item>
              Yeni metafield tanımı ekle: namespace ve key gir
            </s-list-item>
            <s-list-item>
              Her ürün varyantına raf konumunu gir (ör: A-12-3)
            </s-list-item>
          </s-ordered-list>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
