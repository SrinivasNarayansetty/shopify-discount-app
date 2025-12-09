import { useState, useEffect, useCallback } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const configResponse = await admin.graphql(`
    query {
      currentAppInstallation {
        metafield(namespace: "volume_discount", key: "rules") {
          value
        }
      }
    }
  `);

  const configData = await configResponse.json();
  const metafieldValue =
    configData?.data?.currentAppInstallation?.metafield?.value;

  let config = { products: [], minQty: 2, percentOff: 10 };
  if (metafieldValue) {
    try {
      config = JSON.parse(metafieldValue);
    } catch (e) {
      console.error("Failed to parse config:", e);
    }
  }

  const productsResponse = await admin.graphql(`
    query {
      products(first: 50) {
        nodes {
          id
          title
          featuredImage {
            url
          }
        }
      }
    }
  `);

  const productsData = await productsResponse.json();
  const products = productsData?.data?.products?.nodes || [];

  return { config, products };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const actionType = formData.get("actionType");

  if (actionType === "saveConfig") {
    const selectedProducts = JSON.parse(
      (formData.get("products") as string) || "[]",
    );
    const percentOff = parseInt(
      (formData.get("percentOff") as string) || "10",
      10,
    );
    const minQty = 2;

    const configValue = JSON.stringify({
      products: selectedProducts,
      minQty,
      percentOff,
    });

    const appResponse = await admin.graphql(`
      query {
        currentAppInstallation {
          id
        }
      }
    `);
    const appData = await appResponse.json();
    const ownerId = appData?.data?.currentAppInstallation?.id;

    const response = await admin.graphql(
      `
      mutation SetMetafield($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
      {
        variables: {
          metafields: [
            {
              namespace: "volume_discount",
              key: "rules",
              type: "json",
              value: configValue,
              ownerId: ownerId,
            },
          ],
        },
      },
    );

    const result = await response.json();

    if (result.data?.metafieldsSet?.userErrors?.length > 0) {
      return {
        success: false,
        error: result.data.metafieldsSet.userErrors[0].message,
      };
    }

    return { success: true, message: "Configuration saved!" };
  }

  return { success: false };
};

export default function Index() {
  const { config, products } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    config.products || [],
  );
  const [percentOff, setPercentOff] = useState(
    config.percentOff?.toString() || "10",
  );

  const isLoading = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show("Configuration saved successfully!");
    } else if (fetcher.data?.error) {
      shopify.toast.show(fetcher.data.error, { isError: true });
    }
  }, [fetcher.data, shopify]);

  const handleSave = useCallback(() => {
    fetcher.submit(
      {
        actionType: "saveConfig",
        products: JSON.stringify(selectedProducts),
        percentOff: percentOff,
      },
      { method: "POST" },
    );
  }, [fetcher, selectedProducts, percentOff]);

  const toggleProduct = useCallback((productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  return (
    <s-page heading="Volume Discount Configuration">
      <s-button
        slot="primary-action"
        onClick={handleSave}
        {...(isLoading ? { loading: true } : {})}
      >
        Save Configuration
      </s-button>

      <s-section heading="Discount Settings">
        <s-paragraph>
          Configure "Buy 2, get X% off" discount for selected products.
        </s-paragraph>

        <s-stack direction="block" gap="base">
          <s-box padding="base">
            <s-stack direction="block" gap="base">
              <s-text>Discount Percentage:</s-text>
              <s-stack direction="inline" gap="base">
                <input
                  type="number"
                  value={percentOff}
                  onChange={(e) => setPercentOff(e.target.value)}
                  min={1}
                  max={80}
                  style={{
                    padding: "8px 12px",
                    fontSize: "16px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    width: "100px",
                  }}
                />
                <s-text>%</s-text>
              </s-stack>
              <span style={{ color: "#6b7280", fontSize: "13px" }}>Enter a value between 1 and 80</span>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section
        heading={`Select Products (${selectedProducts.length} selected)`}
      >
        <s-stack direction="block" gap="base">
          {products.map((product: any) => {
            const isSelected = selectedProducts.includes(product.id);
            return (
              <div
                key={product.id}
                onClick={() => toggleProduct(product.id)}
                style={{
                  padding: "12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: isSelected ? "#f3f4f6" : "transparent",
                }}
              >
                <s-stack direction="inline" gap="base">
                  {product.featuredImage?.url && (
                    <img
                      src={product.featuredImage.url}
                      alt={product.title}
                      style={{
                        width: 50,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  )}
                  <s-stack direction="block" gap="none">
                    <s-text>
                      <span style={{ fontWeight: isSelected ? "bold" : "normal" }}>
                        {product.title}
                      </span>
                    </s-text>
                    <span style={{ color: "#6b7280", fontSize: "13px" }}>
                      {isSelected ? "✓ Selected" : "Click to select"}
                    </span>
                  </s-stack>
                </s-stack>
              </div>
            );
          })}
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Current Configuration">
        <s-paragraph>
          <strong>Products Selected:</strong> {selectedProducts.length}
        </s-paragraph>
        <s-paragraph>
          <strong>Discount:</strong> {percentOff}%
        </s-paragraph>
        <s-paragraph>
          <strong>Min Quantity:</strong> 2
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="How it works">
        <s-ordered-list>
          <s-list-item>Select products for volume discount</s-list-item>
          <s-list-item>Set the discount percentage</s-list-item>
          <s-list-item>Click "Save Configuration"</s-list-item>
          <s-list-item>Customers buying 2+ units get the discount!</s-list-item>
        </s-ordered-list>
      </s-section>
    </s-page>
  );
}
