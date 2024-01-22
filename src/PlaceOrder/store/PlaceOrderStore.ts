import { observable, computed, action, makeObservable } from "mobx";

import type { OrderSide } from "../model";

export class PlaceOrderStore {
  constructor() {
    makeObservable(this);
  }

  @observable activeOrderSide: OrderSide = "buy";
  @observable price = 0;
  @observable amount = 0;

  @computed get total(): number {
    return this.price * this.amount;
  }

  @action
  public setOrderSide = (side: OrderSide) => {
    this.activeOrderSide = side;
  };

  @action
  public setPrice = (price: number) => {
    this.price = price;
  };

  @action
  public setAmount = (amount: number) => {
    this.amount = amount;
  };

  @action
  public setTotal = (total: number) => {
    this.amount = this.price > 0 ? total / this.price : 0;
  };
}
