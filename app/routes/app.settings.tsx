import { useEffect, useState, useCallback } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher, useNavigate, useOutletContext } from "react-router";
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
  const { t } = useOutletContext<any>();

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
        shopify.toast.show(t("bins.toast.setup"));
        navigate("/app/bins");
      } else {
        shopify.toast.show(t("bins.toast.saved"));
      }
    }
  }, [fetcher.data, isConfigured, navigate, t]);

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
      <Page title={t("onboarding.welcome")} narrowWidth>
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <Banner title={t("onboarding.wizard.title")} tone="info">
                {t("onboarding.wizard.desc")}
              </Banner>

              <Card>
                <BlockStack gap="500">
                  <Text as="h2" variant="headingMd">{t("onboarding.settings.title")}</Text>
                  
                  <ChoiceList
                    title={t("onboarding.choice.title")}
                    choices={[
                      {
                        label: t("onboarding.choice.auto"),
                        value: 'auto',
                        helpText: t("onboarding.choice.auto.help")
                      },
                      {
                        label: t("onboarding.choice.custom"),
                        value: 'custom',
                        helpText: t("onboarding.choice.custom.help")
                      },
                    ]}
                    selected={setupType}
                    onChange={setSetupType}
                  />

                  {isCustom && (
                    <Box paddingBlockStart="300">
                      <BlockStack gap="400">
                        <Text as="p" tone="subdued">
                          {t("onboarding.custom.instruction")}
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
                      {t("onboarding.button.finish")}
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
      title={t("settings.title")}
      primaryAction={{
        content: t("settings.save"),
        onAction: handleSave,
        loading: isSaving,
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">{t("settings.metafield.title")}</Text>
                <Text as="p" tone="subdued">
                  {t("settings.metafield.desc")}
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
                <Text as="h2" variant="headingMd">{t("settings.note.title")}</Text>
                
                <TextField
                  label={t("settings.note.label")}
                  value={notePrefix}
                  onChange={setNotePrefix}
                  autoComplete="off"
                  helpText={t("settings.note.help")}
                />

                <Box
                  padding="400"
                  background="bg-surface-secondary"
                  borderRadius="200"
                >
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">{t("settings.preview")}</Text>
                    <div style={{ whiteSpace: "pre-wrap", fontSize: "13px", fontFamily: "monospace" }}>
                      {notePrefix || "📦 RAF KONUMLARI:"}
                      {"\n"}{t("settings.preview.example1")}
                      {"\n"}{t("settings.preview.example2")}
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
              <Text as="h2" variant="headingMd">{t("settings.help.title")}</Text>
              <Text as="h3" variant="headingSm">{t("settings.help.metafield")}</Text>
              <Text as="p">
                {t("settings.help.metafield.desc")}
              </Text>
              <Text as="h3" variant="headingSm">{t("settings.help.bins")}</Text>
              <Text as="p">
                {t("settings.help.bins.desc")}
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
