import { StoreProvider } from "./context";
import { PlaceOrderForm } from "./PlaceOrderForm";
import { FormValidationProvider } from "provider/FormValidationContext ";

export const PlaceOrder = () => (
  <StoreProvider>
    <FormValidationProvider>
      <PlaceOrderForm />
    </FormValidationProvider>
  </StoreProvider>
);
