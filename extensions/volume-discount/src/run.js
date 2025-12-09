// @ts-nocheck

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/** @type {FunctionRunResult} */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: "FIRST",
  discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const metafieldValue = input?.discountNode?.metafield?.value;

  if (!metafieldValue) {
    console.error("No metafield configuration found");
    return EMPTY_DISCOUNT;
  }

  let config;
  try {
    config = JSON.parse(metafieldValue);
  } catch (error) {
    console.error("Failed to parse metafield:", error);
    return EMPTY_DISCOUNT;
  }

  const { products, minQty, percentOff } = config;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return EMPTY_DISCOUNT;
  }

  if (!minQty || !percentOff) {
    return EMPTY_DISCOUNT;
  }

  const targets = [];

  for (const line of input.cart.lines) {
    const productId = line.merchandise?.product?.id;
    if (!productId) continue;

    const isConfiguredProduct = products.includes(productId);
    const meetsQuantity = line.quantity >= minQty;

    if (isConfiguredProduct && meetsQuantity) {
      targets.push({
        cartLine: { id: line.id },
      });
    }
  }

  if (targets.length === 0) {
    return EMPTY_DISCOUNT;
  }

  return {
    discountApplicationStrategy: "FIRST",
    discounts: [
      {
        targets: targets,
        value: {
          percentage: { value: percentOff.toString() },
        },
        message: `Buy ${minQty}, get ${percentOff}% off`,
      },
    ],
  };
}
