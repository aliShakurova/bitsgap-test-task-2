import React, { useState, useEffect, Dispatch, SetStateAction, ChangeEvent } from "react";
import { Switch } from "shared/components/Switch/Switch";
import { TextButton } from "shared/components/TextButton/TextButton";
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { QuestionTooltip } from "shared/components/QuestionTooltip/QuestionTooltip";
import { OrderSide } from "../../model";
import { OrderSideType } from "PlaceOrder/types";
import { ValidationFieldType } from "PlaceOrder/types";
import { useFormValidationContext } from "provider/FormValidationContext ";

import styles from "./TakeProfit.module.scss";
import Close from "@assets/icons/Close.svg";

export interface Error {
  id: string | number;
  message: string;
}
interface TakeProfitProps {
  activeOrderSide: OrderSide;
  price: number;
  amount: number;
  errors: Error[] | null;
  setErrors: Dispatch<SetStateAction<Error[] | null>>
}

interface Profit {
  amountToSellBuy: number;
  profit: number;
  projectedProfit: number;
  targetPrice: number;
}

const TakeProfit = ({ activeOrderSide, price, amount, errors, setErrors }: TakeProfitProps) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [profitList, setProfitList] = useState<Array<Profit>>([]);
  const [projectedProfitSum, setProjectedProfitSum] = useState<number>(0);
  const { registerValidation, unregisterValidation } = useFormValidationContext();

  useEffect(() => {
    if (profitList.length > 0) {
      const newProfitList = getProfitList(profitList);
      setProfitList(newProfitList);
      const projectedProfitSum = calculateProjectedProfitSum(newProfitList);
      setProjectedProfitSum(projectedProfitSum);
      handleValidationErrors(newProfitList);
    }
  }, [activeOrderSide, price, amount]);

  useEffect(() => {
    if (profitList) {
      const projectedProfitSum = calculateProjectedProfitSum(profitList);
      setProjectedProfitSum(projectedProfitSum);
      handleValidationErrors(profitList);
    }
  }, [profitList.length]);

  useEffect(() => {
    if (!price || !amount) {
      setProfitList([])
      setIsActive(false)
    }
  }, [price, amount]);

  const handleToggle = () => {
    if (price && amount) {
      setIsActive(prevState => !prevState);
      addProfitTarget();
    }
    if (isActive) {
      setProfitList([]);
      setErrors(null);
    }
  };

  const calculateTargetPrice = (profit = 2) => {
    return activeOrderSide === OrderSideType.BUY
      ? price * (1 + profit / 100)
      : price * (1 - profit / 100);
  };

  const calculateProjectedProfit = (targetPrice: number, amountToBuySell: number) => {
    return activeOrderSide === OrderSideType.BUY ?
      amountToBuySell * (targetPrice - price)
      : amountToBuySell * (price - targetPrice);
  };

  const calculateProjectedProfitSum = (profitList: Profit[]): number => profitList.reduce((acc, row) => acc + row.projectedProfit, 0);

  const amountProfit = profitList ? Number(amount) / Number((profitList?.length + 1)) : 0;

  const getProfitList = (list: Profit[]): Profit[] => {
    const calculateProfitAmountInPrecents = 100 / (list.length);
    const newProfitList = list.map((item) => {
      const amountProfit = Number(amount) / Number((list.length));
      const targetPrice = calculateTargetPrice(item.profit);
      const recalculateProjectedProfit = calculateProjectedProfit(targetPrice, amountProfit);
      return { amountToSellBuy: calculateProfitAmountInPrecents, targetPrice, profit: item.profit, projectedProfit: recalculateProjectedProfit };
    })
    return newProfitList;
  }

  const getEditedProfitList = (list: Profit[]): Profit[] => {
    const newProfitList = list.map((item) => {
      const amountProfit = Number(amount) * (item.amountToSellBuy / 100);
      const targetPrice = calculateTargetPrice(item.profit);
      const recalculateProjectedProfit = calculateProjectedProfit(targetPrice, amountProfit);
      return { amountToSellBuy: Number(item.amountToSellBuy), targetPrice, profit: item.profit, projectedProfit: recalculateProjectedProfit };
    })
    return newProfitList;
  }

  const createData = (
    profit: number,
    targetPrice: number,
    amountToSellBuy: number,
  ) => {
    return { profit, targetPrice, amountToSellBuy, projectedProfit: calculateProjectedProfit(targetPrice, amountProfit) };
  }

  const addProfitTarget = () => {
    const calculateProfitAmountInPrecents = 100 / (profitList.length + 1);
    const newProfitList = profitList?.map((item) => {
      const reCalculateprojectedProfit = calculateProjectedProfit(item.targetPrice, amountProfit)
      return { amountToSellBuy: calculateProfitAmountInPrecents, targetPrice: item.targetPrice, profit: item.profit, projectedProfit: reCalculateprojectedProfit };
    })
    const profitTarget = newProfitList[newProfitList.length - 1]?.profit + 2 || 2;
    const targetPrice = calculateTargetPrice(profitTarget);
    const profitData = createData(profitTarget, targetPrice, calculateProfitAmountInPrecents);
    setProfitList([...newProfitList, profitData]);
  }

  const handleProfitData = (event: ChangeEvent<HTMLInputElement>, index: number, type: string) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const updatedProfitList = profitList.map((item: Profit, itemIndex) => {
      if (itemIndex === index) {
        const updatedValue = { [type]: Number(value) };
        return { ...item, ...updatedValue };
      }
      return item;
    })
    const newProfitList = getEditedProfitList(updatedProfitList);
    const projectedProfitSum = calculateProjectedProfitSum(newProfitList);
    setProjectedProfitSum(projectedProfitSum);
    setProfitList(newProfitList);
    handleValidationErrors(newProfitList);
  }

  const handleRemoveItem = (id: number) => {
    const filtededProfitList = profitList.filter((item) => item.profit !== id);
    const newProfitList = getProfitList(filtededProfitList);
    const projectedProfitSum = calculateProjectedProfitSum(newProfitList);
    setProjectedProfitSum(projectedProfitSum);
    setProfitList(newProfitList);
    const errorList = valitate(newProfitList);
    if (errorList)
    setErrors(errorList);
  }

  const handleValidationErrors = (list: Profit[]) => {
    const errorList = valitate(list);
    unregisterValidation(ValidationFieldType.TAKE_PROFIT);
    if (errorList && errorList.length > 0) {
      registerValidation(ValidationFieldType.TAKE_PROFIT, errorList);
    }
  }

  const valitate = (profitList: Profit[]) => {
    let totalProfit = 0;
    let totalAmount = 0;
    const errorSet: Set<Error> = new Set();

    if (profitList?.length > 0) {
      for (let i = 0; i < profitList.length; i++) {
        totalProfit += profitList[i].profit;
        totalAmount += profitList[i].amountToSellBuy;

        if (profitList[i].profit < 0.01) {
          errorSet.add({ id: i, message: "Minimum value for profit is 0.01%." });
        }
        if (i > 0 && profitList[i].profit < profitList[i - 1].profit) {
          errorSet.add({ id: i, message: "Each target's profit should be greater than the previous one." });
        }
        if (profitList[i].targetPrice < 0) {
          errorSet.add({ id: i, message: "Price must be greater than 0." });
        }
      }

      if (totalProfit > 500) {
        errorSet.add({ id: "totalProfit", message: "Maximum profit sum is 500%." });
      }

      if (totalAmount !== 100) {
        const message = totalAmount > 100
          ? `${totalAmount} out of 100% selected. Please decrease by ${totalAmount - 100}.`
          : `${totalAmount} out of 100% selected. Please increase by ${100 - totalAmount}.`;
        errorSet.add({ id: "totalAmount", message });
      }

      return Array.from(errorSet);
    }
  }

  const isItemWithError = (index: number) => {
    if (errors && errors.length > 0 && errors.find((item: Error) => item.id === index)) {
      return styles.profitError
    }
    return '';
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.label}><QuestionTooltip message={"Some Info"} /> <span className={styles.name}>Take Profit</span></div>
        <Switch
          checked={isActive}
          onChange={handleToggle}
        />
      </div>
      {isActive && (
        <>
          <table>
            <thead>
              <tr>
                <td>Profit</td>
                <td>Target price</td>
                <td className={styles.amountToBuySell}>{activeOrderSide === OrderSideType.BUY ? "Amount to buy" : "Amount to sell"}</td>
              </tr>
            </thead>
            <tbody>
              {profitList && profitList?.map((row, index) => (
                <tr className={`${isItemWithError(index)}`} key={index}>
                  <td>
                    <div className={styles.inputWrapper}><input className={styles.input} type="number" value={row.profit} onChange={(event) => handleProfitData(event, index, 'profit')} />
                      <span className={styles.unitPrecentProfit} >%</span></div>
                  </td>
                  <td>
                    <span className={styles.targetPrice}>{(row.targetPrice).toFixed(1)}</span>&nbsp;<span className={styles.unitUSDT}>USDT</span>
                  </td>
                  <td>
                    <input className={styles.input} type="number" value={row.amountToSellBuy} onChange={(event) => handleProfitData(event, index, 'amountToSellBuy')} />
                    <span className={styles.unitPrecentAmount} >%</span>
                    <div className={styles.closeIconWrapper}>
                      <IconButton aria-label="delete" onClick={() => handleRemoveItem(row.profit)} >
                        <img src={Close} className={styles.closeIcon} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {errors && errors?.length > 0 && (
            <div className={styles.error}>
              {errors.map((error: Error) => <div key={error?.message}>{error.message}</div>)}
            </div>
          )}
          {profitList && profitList?.length < 5 ? <div className={styles.buttonContainer} >
            <TextButton startIcon={<AddCircleIcon />} onClick={addProfitTarget} className={styles.button}>{`Add profit target ${profitList.length}/5`}</TextButton>
          </div> : null}
          <div className={styles.profitBlock} >
            <div className={styles.name}>Projected profit</div>
            <div className={styles.separator}></div>
            <div className={styles.sum}><span className={styles.amount}>{(projectedProfitSum).toFixed(2)}</span> USDT</div>
          </div>
        </>
      )}
    </div>
  );
};

export { TakeProfit };
