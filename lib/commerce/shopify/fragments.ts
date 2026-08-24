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
        { namespace: "spec", key: "material" }
        { namespace: "spec", key: "composition" }
        { namespace: "spec", key: "weight_grams" }
        { namespace: "spec", key: "origin" }
        { namespace: "spec", key: "care" }
        { namespace: "story", key: "body" }
        { namespace: "spec", key: "features" }
        { namespace: "spec", key: "specs" }
        { namespace: "rec", key: "pairs_with" }
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
