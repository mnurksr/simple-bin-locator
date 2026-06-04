/**
 * GraphQL mutation to update an order's note attribute.
 * Used to append bin location information to orders.
 * @module
 */

/** Response shape for the orderUpdate mutation. */
export interface OrderUpdateResponse {
  data: {
    orderUpdate: {
      order: {
        id: string;
        note: string | null;
      } | null;
      userErrors: Array<{
        field: string[];
        message: string;
      }>;
    };
  };
}

/**
 * Mutation to update an order's note field.
 * Accepts an OrderInput with the order ID and new note content.
 */
export const UPDATE_ORDER_NOTE = `#graphql
  mutation UpdateOrderNote($input: OrderInput!) {
    orderUpdate(input: $input) {
      order {
        id
        note
      }
      userErrors {
        field
        message
      }
    }
  }
`;
