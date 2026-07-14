interface PaymentMethod {
  id: string;
  name: string;
}

interface ProductNode {
  metafield?: {
    value?: string | null;
  } | null;
}

interface Merchandise {
  __typename: string;
  product?: ProductNode | null;
}

interface CartLine {
  merchandise: Merchandise;
}

interface RunInput {
  cart: {
    buyerIdentity?: {
      purchasingCompany?: {
        company?: {
          id: string;
        } | null;
      } | null;
    } | null;
    lines: CartLine[];
  };
  paymentMethods: PaymentMethod[];
}

interface PaymentMethodHideOperation {
  paymentMethodHide: {
    paymentMethodId: string;
  };
}

interface PaymentTermsSetOperation {
  paymentTermsSet: {
    paymentTerms: {
      event: {
        trigger: string;
      };
    };
  };
}

type Operation = PaymentMethodHideOperation | PaymentTermsSetOperation;

interface FunctionRunResult {
  operations: Operation[];
}

// "Due on fulfillment" B2B payment terms map to an event-based term that is
// triggered when a fulfillment is created for the order.
const DUE_ON_FULFILLMENT_TRIGGER = "FULFILLMENT_CREATED";

// Deferred B2B payment methods are hidden so that a card/bank account is vaulted
// at checkout, which is what lets Flow charge automatically on fulfillment. The
// underlying method name is "Deferred" (rendered at checkout as "Choose payment
// method at a later time"); "later" is kept as a fallback for other stores.
const DEFERRED_METHOD_PATTERNS = ["deferred", "later"];

const NO_CHANGES: FunctionRunResult = { operations: [] };

export function cartPaymentMethodsTransformRun(input: RunInput): FunctionRunResult {
  const isB2B = Boolean(input.cart.buyerIdentity?.purchasingCompany?.company?.id);
  if (!isB2B) {
    return NO_CHANGES;
  }

  const hasPrebookItem = input.cart.lines.some(lineIsPrebook);
  if (!hasPrebookItem) {
    return NO_CHANGES;
  }

  const setDueOnFulfillment: PaymentTermsSetOperation = {
    paymentTermsSet: {
      paymentTerms: {
        event: {
          trigger: DUE_ON_FULFILLMENT_TRIGGER,
        },
      },
    },
  };

  const hideDeferredMethods = input.paymentMethods
    .filter((method) => methodMatchesAnyPattern(method, DEFERRED_METHOD_PATTERNS))
    .map((method) => hidePaymentMethod(method.id));

  return {
    operations: [setDueOnFulfillment, ...hideDeferredMethods],
  };
}

function lineIsPrebook(line: CartLine): boolean {
  const value = line.merchandise.product?.metafield?.value;
  return typeof value === "string" && value.trim().length > 0;
}

function hidePaymentMethod(paymentMethodId: string): PaymentMethodHideOperation {
  return {
    paymentMethodHide: {
      paymentMethodId,
    },
  };
}

function methodMatchesAnyPattern(method: PaymentMethod, patterns: string[]): boolean {
  const normalizedName = method.name.toLowerCase();
  return patterns.some((pattern) => normalizedName.includes(pattern));
}

export { DUE_ON_FULFILLMENT_TRIGGER, DEFERRED_METHOD_PATTERNS };
