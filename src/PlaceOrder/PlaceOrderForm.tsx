import React, { useState } from "react";
import { observer } from "mobx-react";

import { QuestionTooltip } from "shared/components/QuestionTooltip/QuestionTooltip";
import { Button } from "shared/components/Button/Button";
import { NumberInput } from "shared/components/NumberInput/NumberInput";

import { BASE_CURRENCY, QUOTE_CURRENCY } from "./constants";
import { useStore } from "./context";
import { PlaceOrderTypeSwitch } from "./components/PlaceOrderTypeSwitch/PlaceOrderTypeSwitch";
import { TakeProfit } from "./components/TakeProfit/TakeProfit";
import { useFormValidationContext } from "provider/FormValidationContext ";
import { OrderSideType, ValidationFieldType } from "./types";

import styles from "./PlaceOrderForm.module.scss";

export interface Error {
  id: string | number;
  message: string;
}

export const PlaceOrderForm = observer(() => {
  const {
    activeOrderSide,
    price,
    total,
    amount,
    setPrice,
    setAmount,
    setTotal,
    setOrderSide,
  } = useStore();
  const { validationErrors, getValidationErrorsByName } = useFormValidationContext();
  const [takeProfitErrors, setTakeProfitErrors] = useState<Array<Error> | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validationErrors.length > 0) {
      const takeProfitErrors = getValidationErrorsByName(ValidationFieldType.TAKE_PROFIT)?.errors
      if (takeProfitErrors && takeProfitErrors.length > 0) {
        setTakeProfitErrors(takeProfitErrors)
      }
      // Handle validation errors
      console.log('Validation errors');
    } else {
      setTakeProfitErrors([])
      // Form is valid
      console.log('Form submitted');
    }
  }

  return (
    <form className={styles.root} onSubmit={handleSubmit}>
      <div className={styles.label}>
        Market direction{" "}
        <QuestionTooltip message="Market direction description" />
      </div>
      <div className={styles.content}>
        <div className={styles.typeSwitch}>
          <PlaceOrderTypeSwitch
            activeOrderSide={activeOrderSide}
            onChange={setOrderSide}
          />
        </div>
        <NumberInput
          label={`Price, ${QUOTE_CURRENCY}`}
          value={price}
          onChange={(value) => setPrice(Number(value))}
        />
        <NumberInput
          value={amount}
          label={`Amount, ${BASE_CURRENCY}`}
          onChange={(value) => setAmount(Number(value))}
        />
        <NumberInput
          value={total}
          label={`Total, ${QUOTE_CURRENCY}`}
          onChange={(value) => setTotal(Number(value))}
        />
        <TakeProfit activeOrderSide={activeOrderSide} price={price} amount={amount} errors={takeProfitErrors} setErrors={setTakeProfitErrors}/>
        <div className={styles.submit}>
          <Button
            color={activeOrderSide === OrderSideType.BUY ? "green" : "red"}
            type="submit"
            fullWidth
          >
            {activeOrderSide === OrderSideType.BUY
              ? `Buy ${BASE_CURRENCY}`
              : `Sell ${QUOTE_CURRENCY}`}
          </Button>
        </div>
      </div>
    </form>
  );
});
