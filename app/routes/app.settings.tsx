import { useEffect, useState, useCallback } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  TextField,
  Button,
  ChoiceList,
  Banner,
  InlineStack,
  Box
} from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const settings = await db.appSettings.findUnique({
    where: { shop },
  });

  return Response.json({
    isConfigured: !!settings,
    settings: settings ?? {
      metafieldNamespace: "warehouse",
      metafieldKey: "bin_location",
      isActive: true,
      notePrefix: "📦 RAF KONUMLARI:",
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const metafieldNamespace = (formData.get("metafieldNamespace") as string) || "warehouse";
  const metafieldKey = (formData.get("metafieldKey") as string) || "bin_location";
  const notePrefix = (formData.get("notePrefix") as string) || "📦 RAF KONUMLARI:";
  const isActive = formData.get("isActive") !== "false";

  await db.appSettings.upsert({
    where: { shop },
    update: { metafieldNamespace, metafieldKey, notePrefix, isActive },
    create: { shop, metafieldNamespace, metafieldKey, notePrefix, isActive },
  });

  return Response.json({ success: true });
};

export default function Settings() {
  const { settings, isConfigured } = useLoaderData<any>();
  const fetcher = useFetcher<any>();
  const navigate = useNavigate();

  const isSaving = fetcher.state !== "idle";

  // Form states
  const [setupType, setSetupType] = useState<string[]>(isConfigured ? ["custom"] : ["auto"]);
  const [namespace, setNamespace] = useState(settings.metafieldNamespace);
  const [key, setKey] = useState(settings.metafieldKey);
  const [notePrefix, setNotePrefix] = useState(settings.notePrefix);

  const isCustom = setupType[0] === "custom";

  useEffect(() => {
    if (fetcher.data?.success) {
      if (!isConfigured) {
        // If it was the first time setup, redirect to Bins Management
        shopify.toast.show("Kurulum tamamlandı!");
        navigate("/app/bins");
      } else {
        shopify.toast.show("Ayarlar başarıyla kaydedildi.");
      }
    }
  }, [fetcher.data, isConfigured, navigate]);

  const handleSave = useCallback(() => {
    const formData = new FormData();
    if (isCustom || isConfigured) {
      formData.append("metafieldNamespace", namespace);
      formData.append("metafieldKey", key);
    } else {
      formData.append("metafieldNamespace", "warehouse");
      formData.append("metafieldKey", "bin_location");
    }
    formData.append("notePrefix", notePrefix);
    formData.append("isActive", "true");

    fetcher.submit(formData, { method: "POST" });
  }, [isCustom, isConfigured, namespace, key, notePrefix, fetcher]);

  if (!isConfigured) {
    return (
      <Page title="Hoş Geldiniz! 👋" narrowWidth>
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <Banner title="Kurulum Sihirbazı" tone="info">
                Simple Bin Locator uygulamasını kullanmaya başlamak için raf konumlarını Shopify'da nasıl tutacağımızı ayarlamamız gerekiyor. Bu işlem sadece 10 saniyenizi alacak!
              </Banner>

              <Card>
                <BlockStack gap="500">
                  <Text as="h2" variant="headingMd">Raf Konumu Ayarları</Text>
                  
                  <ChoiceList
                    title="Daha önce Shopify'da ürünleriniz için bir 'Raf Konumu' metafield'ı oluşturmuş muydunuz?"
                    choices={[
                      {
                        label: 'Hayır, benim için her şeyi otomatik oluştur',
                        value: 'auto',
                        helpText: "Uygulama sizin için arka planda her şeyi ayarlar. Önerilen."
                      },
                      {
                        label: 'Evet, halihazırda kullandığım bir metafield var',
                        value: 'custom',
                        helpText: "Kendi kullandığınız Namespace ve Key değerlerini girebilirsiniz."
                      },
                    ]}
                    selected={setupType}
                    onChange={setSetupType}
                  />

                  {isCustom && (
                    <Box paddingBlockStart="300">
                      <BlockStack gap="400">
                        <Text as="p" tone="subdued">
                          Kullandığınız metafield bilgilerini aşağıya girin.
                        </Text>
                        <InlineStack gap="400">
                          <TextField
                            label="Metafield Namespace"
                            value={namespace}
                            onChange={setNamespace}
                            autoComplete="off"
                            placeholder="custom"
                          />
                          <TextField
                            label="Metafield Key"
                            value={key}
                            onChange={setKey}
                            autoComplete="off"
                            placeholder="raf_no"
                          />
                        </InlineStack>
                      </BlockStack>
                    </Box>
                  )}

                  <Box paddingBlockStart="400">
                    <Button
                      size="large"
                      variant="primary"
                      onClick={handleSave}
                      loading={isSaving}
                      fullWidth
                    >
                      Kurulumu Tamamla ve Başla
                    </Button>
                  </Box>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // Normal Settings Page for Configured Users
  return (
    <Page
      title="Ayarlar"
      primaryAction={{
        content: "Değişiklikleri Kaydet",
        onAction: handleSave,
        loading: isSaving,
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Metafield Yapılandırması</Text>
                <Text as="p" tone="subdued">
                  Ürün varyantlarınızdaki raf konumu metafield'ının namespace ve key değerlerini girin. Bu değerler, webhook tetiklendiğinde ve Raf Yönetimi ekranında hangi alanın kullanılacağını belirler.
                </Text>
                
                <InlineStack gap="400">
                  <div style={{ flex: 1 }}>
                    <TextField
                      label="Metafield Namespace"
                      value={namespace}
                      onChange={setNamespace}
                      autoComplete="off"
                      helpText="Örnek: warehouse, custom, shelf"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <TextField
                      label="Metafield Key"
                      value={key}
                      onChange={setKey}
                      autoComplete="off"
                      helpText="Örnek: bin_location, shelf_number, rack_id"
                    />
                  </div>
                </InlineStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Sipariş Notu Formatı</Text>
                
                <TextField
                  label="Not Başlığı"
                  value={notePrefix}
                  onChange={setNotePrefix}
                  autoComplete="off"
                  helpText="Sipariş notunun başına eklenecek başlık metni"
                />

                <Box
                  padding="400"
                  background="bg-surface-secondary"
                  borderRadius="200"
                >
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">Önizleme:</Text>
                    <div style={{ whiteSpace: "pre-wrap", fontSize: "13px", fontFamily: "monospace" }}>
                      {notePrefix || "📦 RAF KONUMLARI:"}
                      {"\n"}• [SKU-001] Örnek Ürün (Kırmızı / M) → A-12-3 (x2)
                      {"\n"}• [SKU-002] Başka Ürün (Mavi / L) → B-05-1 (x1)
                    </div>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Yardım</Text>
              <Text as="h3" variant="headingSm">Metafield Nedir?</Text>
              <Text as="p">
                Metafield'lar, Shopify ürün varyantlarına eklenen özel veri alanlarıdır. Raf konumlarını saklamak için her varyanta bir metafield atamanız gerekir.
              </Text>
              <Text as="h3" variant="headingSm">Raf Yönetimi</Text>
              <Text as="p">
                Uygulamamızın "Raf Yönetimi" sayfası sayesinde Shopify ayarlarına hiç girmeden tüm ürünlerinizin raf konumlarını tek bir ekrandan kolayca yönetebilirsiniz.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
