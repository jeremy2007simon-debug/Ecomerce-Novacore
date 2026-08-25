/**
 * PRODUCTION INTEGRATION REQUIRED — GraphQL documents.
 *
 * Written out in full so the field selection is reviewable before any
 * credentials exist. Every field here has a corresponding property on our
 * `Product` type; that correspondence is what `normalize.ts` implements.
 */

export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    productType
    vendor
    tags
    availableForSale
    seo {
      title
      description
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    options {
      id
      name
      values
    }
    images(first: 12) {
      nodes {
        url
        altText
        width
        height
      }
    }
    variants(first: 100) {
      nodes {
        id
        sku
        title
        availableForSale
        quantityAvailable
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
        image {
          url
          altText
          width
          height
        }
      }
    }
    collections(first: 10) {
      nodes {
        handle
      }
    }
    metafields(
      identifiers: [
        { namespace: "spec", key: "subtitle" }
        { namespace: "spec", key: "material" }
        { namespace: "spec", key: "composition" }
        { namespace: "spec", key: "weight_grams" }
        { namespace: "spec", key: "origin" }
        { namespace: "spec", key: "care" }
        { namespace: "story", key: "body" }
        { namespace: "spec", key: "features" }
        { namespace: "spec", key: "specs" }
        { namespace: "rec", key: "pairs_with" }
        { namespace: "spec", key: "shipping" }
        { namespace: "spec", key: "returns" }
      ]
    ) {
      namespace
      key
      value
      type
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ProductByHandle($handle: String!, $language: LanguageCode!, $country: CountryCode!)
  @inContext(language: $language, country: $country) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

export const PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query Products(
    $first: Int!
    $after: String
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $language: LanguageCode!
    $country: CountryCode!
  ) @inContext(language: $language, country: $country) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
      nodes {
        ...ProductFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PRODUCT_HANDLES_QUERY = /* GraphQL */ `
  query ProductHandles($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        handle
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const RECOMMENDATIONS_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query Recommendations(
    $productId: ID!
    $intent: ProductRecommendationIntent!
    $language: LanguageCode!
    $country: CountryCode!
  ) @inContext(language: $language, country: $country) {
    productRecommendations(productId: $productId, intent: $intent) {
      ...ProductFields
    }
  }
`;

export const PRODUCTS_IN_COLLECTION_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ProductsInCollection(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $language: LanguageCode!
    $country: CountryCode!
  ) @inContext(language: $language, country: $country) {
    collection(handle: $handle) {
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
        nodes {
          ...ProductFields
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const COLLECTION_FRAGMENT = /* GraphQL */ `
  fragment CollectionFields on Collection {
    handle
    title
    description
    image {
      url
      altText
      width
      height
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  ${COLLECTION_FRAGMENT}
  query CollectionByHandle($handle: String!, $language: LanguageCode!, $country: CountryCode!)
  @inContext(language: $language, country: $country) {
    collection(handle: $handle) {
      ...CollectionFields
    }
  }
`;

export const COLLECTIONS_QUERY = /* GraphQL */ `
  ${COLLECTION_FRAGMENT}
  query Collections($first: Int!, $language: LanguageCode!, $country: CountryCode!)
  @inContext(language: $language, country: $country) {
    collections(first: $first) {
      nodes {
        ...CollectionFields
      }
    }
  }
`;

/* ── Cart ─────────────────────────────────────────────────────────────────
   The Storefront cart is the source of truth once COMMERCE_PROVIDER=shopify —
   see lib/store/shopify-cart-store.ts. Every mutation returns userErrors
   inside a 200 response rather than an HTTP error or a top-level GraphQL
   error, so callers must check `userErrors` themselves; client.ts stays a
   generic fetch wrapper and knows nothing about this shape. */

export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            selectedOptions {
              name
              value
            }
            image {
              url
              altText
              width
              height
            }
            product {
              handle
              title
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartCreate($lines: [CartLineInput!]!, $language: LanguageCode!, $country: CountryCode!)
  @inContext(language: $language, country: $country) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesAdd(
    $cartId: ID!
    $lines: [CartLineInput!]!
    $language: LanguageCode!
    $country: CountryCode!
  ) @inContext(language: $language, country: $country) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate(
    $cartId: ID!
    $lines: [CartLineUpdateInput!]!
    $language: LanguageCode!
    $country: CountryCode!
  ) @inContext(language: $language, country: $country) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesRemove(
    $cartId: ID!
    $lineIds: [ID!]!
    $language: LanguageCode!
    $country: CountryCode!
  ) @inContext(language: $language, country: $country) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const CART_QUERY = /* GraphQL */ `
  ${CART_FRAGMENT}
  query CartQuery($cartId: ID!, $language: LanguageCode!, $country: CountryCode!)
  @inContext(language: $language, country: $country) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
`;
