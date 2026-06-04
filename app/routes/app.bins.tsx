import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { useActionData, useLoaderData, useSubmit, useNavigation } from "react-router";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  TextField,
  Button,
  Text,
  Badge,
  Banner,
  BlockStack,
  InlineStack,
  Thumbnail
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useState, useCallback, useEffect } from "react";
import db from "../db.server";

// GraphQL query to fetch products, variants, and their specific metafield
const PRODUCTS_QUERY = `
  query getProductsWithMetafields($namespace: String!, $key: String!, $cursor: String) {
    products(first: 50, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          featuredImage {
            url
            altText
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                metafield(namespace: $namespace, key: $key) {
                  id
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

// GraphQL mutation to set multiple metafields at once
const METAFIELDS_SET_MUTATION = `
  mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  
  // Get the configured namespace and key from our database
  const settings = await db.appSettings.findUnique({
    where: { shop: session.shop },
  });
  
  const namespace = settings?.metafieldNamespace || "warehouse";
  const key = settings?.metafieldKey || "bin_location";

  try {
    const response = await admin.graphql(PRODUCTS_QUERY, {
      variables: {
        namespace,
        key,
      },
    });

    const responseJson = await response.json();
    
    // Flatten the nested GraphQL response into a simple array of variant objects
    const variantsList: any[] = [];
    
    const products = responseJson.data.products.edges;
    products.forEach((productEdge: any) => {
      const product = productEdge.node;
      const variants = product.variants.edges;
      
      variants.forEach((variantEdge: any) => {
        const variant = variantEdge.node;
        variantsList.push({
          productId: product.id,
          productTitle: product.title,
          image: product.featuredImage?.url,
          variantId: variant.id,
          variantTitle: variant.title,
          sku: variant.sku,
          currentBinLocation: variant.metafield?.value || "",
        });
      });
    });

    return Response.json({ 
      variants: variantsList,
      namespace,
      key
    });
  } catch (error) {
    console.error("Error fetching products for bin management", error);
    return Response.json({ variants: [], namespace, key, error: "Ürünler getirilirken bir hata oluştu." });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const updatesRaw = formData.get("updates");
  
  if (!updatesRaw) {
    return Response.json({ success: false, error: "Gönderilecek veri bulunamadı." }, { status: 400 });
  }

  try {
    const updates = JSON.parse(updatesRaw as string);
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return Response.json({ success: false, error: "Geçerli bir güncelleme listesi yok." }, { status: 400 });
    }

    // Get namespace and key
    const settings = await db.appSettings.findUnique({
      where: { shop: session.shop },
    });
    const namespace = settings?.metafieldNamespace || "warehouse";
    const key = settings?.metafieldKey || "bin_location";

    // Format updates for Shopify GraphQL API
    const metafields = updates.map((update: any) => ({
      ownerId: update.variantId,
      namespace: namespace,
      key: key,
      type: "single_line_text_field",
      value: update.binLocation
    }));

    // Execute mutation
    const response = await admin.graphql(METAFIELDS_SET_MUTATION, {
      variables: { metafields },
    });

    const responseJson = await response.json();

    if (responseJson.data?.metafieldsSet?.userErrors?.length > 0) {
      console.error("Metafield Set Errors:", responseJson.data.metafieldsSet.userErrors);
      return Response.json({ 
        success: false, 
        error: "Bazı konumlar güncellenirken Shopify tarafında hata oluştu.",
        details: responseJson.data.metafieldsSet.userErrors 
      }, { status: 400 });
    }

    return Response.json({ success: true, message: `${updates.length} ürün başarıyla güncellendi!` });
  } catch (error) {
    console.error("Error updating bin locations:", error);
    return Response.json({ success: false, error: "Sunucu tarafında bir hata oluştu." }, { status: 500 });
  }
}

export default function BinsManagement() {
  const { variants, namespace, key, error: loaderError } = useLoaderData<any>();
  const actionData = useActionData<any>();
  const submit = useSubmit();
  const navigation = useNavigation();
  
  const isSaving = navigation.state === "submitting";

  // State to hold local changes before saving
  const [editedBins, setEditedBins] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Handle text input change
  const handleBinChange = useCallback((variantId: string, newValue: string) => {
    setEditedBins((prev) => {
      const updated = { ...prev, [variantId]: newValue };
      
      // Check if any value is actually different from the original
      const hasAnyChange = Object.keys(updated).some(id => {
        const originalVariant = variants.find((v: any) => v.variantId === id);
        return originalVariant && originalVariant.currentBinLocation !== updated[id];
      });
      
      setHasChanges(hasAnyChange);
      return updated;
    });
  }, [variants]);

  // Handle save button
  const handleSave = () => {
    // Only send the ones that actually changed
    const updates = Object.keys(editedBins)
      .map(variantId => {
        const original = variants.find((v: any) => v.variantId === variantId);
        const newValue = editedBins[variantId];
        
        if (original && original.currentBinLocation !== newValue) {
          return {
            variantId,
            binLocation: newValue
          };
        }
        return null;
      })
      .filter(Boolean);

    if (updates.length > 0) {
      submit(
        { updates: JSON.stringify(updates) },
        { method: "POST" }
      );
    }
  };

  // Reset changes if save was successful
  useEffect(() => {
    if (actionData?.success) {
      setHasChanges(false);
      // We don't need to clear editedBins because the loader will run again and refresh the UI
      // but to be safe, we can clear the diffs that match the new loader data automatically
    }
  }, [actionData]);

  // Prepare table rows
  const rowMarkup = variants.map(
    (variant: any, index: number) => {
      const isEdited = editedBins[variant.variantId] !== undefined;
      const currentValue = isEdited ? editedBins[variant.variantId] : variant.currentBinLocation;
      
      const isChanged = isEdited && editedBins[variant.variantId] !== variant.currentBinLocation;

      return (
        <IndexTable.Row
          id={variant.variantId}
          key={variant.variantId}
          position={index}
        >
          <IndexTable.Cell>
            <InlineStack gap="300" align="start" blockAlign="center">
              {variant.image ? (
                <Thumbnail source={variant.image} size="small" alt={variant.productTitle} />
              ) : (
                <div style={{ width: 40, height: 40, background: '#f4f6f8', borderRadius: 4 }} />
              )}
              <BlockStack gap="100">
                <Text variant="bodyMd" fontWeight="bold" as="span">
                  {variant.productTitle}
                </Text>
                {variant.variantTitle !== "Default Title" && (
                  <Text variant="bodySm" tone="subdued" as="span">
                    {variant.variantTitle}
                  </Text>
                )}
              </BlockStack>
            </InlineStack>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span" variant="bodyMd">{variant.sku || "-"}</Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <div style={{ maxWidth: "200px" }}>
              <TextField
                label="Raf Konumu"
                labelHidden
                value={currentValue}
                onChange={(val) => handleBinChange(variant.variantId, val)}
                autoComplete="off"
                placeholder="Örn: A-12-3"
              />
            </div>
          </IndexTable.Cell>
          <IndexTable.Cell>
            {isChanged ? (
              <Badge tone="info">Değiştirildi (Kaydedilmedi)</Badge>
            ) : variant.currentBinLocation ? (
              <Badge tone="success">Atandı</Badge>
            ) : (
              <Badge tone="warning">Boş</Badge>
            )}
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    }
  );

  return (
    <Page
      title="Toplu Raf Yönetimi"
      subtitle="Ürünlerinizin depo veya mağaza içi raf konumlarını hızlıca belirleyin."
      primaryAction={{
        content: "Değişiklikleri Kaydet",
        onAction: handleSave,
        disabled: !hasChanges,
        loading: isSaving,
      }}
    >
      <BlockStack gap="500">
        {loaderError && (
          <Banner title="Veri Hatası" tone="critical">
            {loaderError}
          </Banner>
        )}

        {actionData && (
          <Banner 
            title={actionData.success ? "Başarılı!" : "Hata"} 
            tone={actionData.success ? "success" : "critical"}
            onDismiss={() => {}} // In a real app we'd clear the actionData
          >
            {actionData.message || actionData.error}
          </Banner>
        )}

        <Card padding="0">
          <IndexTable
            resourceName={{ singular: 'ürün', plural: 'ürünler' }}
            itemCount={variants.length}
            headings={[
              { title: 'Ürün' },
              { title: 'SKU' },
              { title: `Raf Konumu (${namespace}.${key})` },
              { title: 'Durum' },
            ]}
            selectable={false}
          >
            {rowMarkup}
          </IndexTable>
        </Card>
      </BlockStack>
    </Page>
  );
}
