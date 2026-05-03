import React from "react";
import { Send, X } from "lucide-react";
import { CartList } from "./CartList.jsx";
import { formatMoney } from "../utils/format.js";

export function CartDrawer({ cartItems, cartOpen, cartTotal, onCheckoutOpen, onClose, onUpdateQty }) {
  return (
    <div className={`cart-drawer glass ${cartOpen ? "is-open" : ""}`} aria-hidden={!cartOpen}>
      <div className="drawer-head">
        <h3>Savat</h3>
        <button className="icon-button ghost" type="button" aria-label="Savatni yopish" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      </div>
      <CartList compact cartItems={cartItems} onUpdateQty={onUpdateQty} />
      <div className="cart-total">
        <span>Jami</span>
        <strong>{formatMoney(cartTotal)}</strong>
      </div>
      <button
        className="primary-button full"
        type="button"
        disabled={cartItems.length === 0}
        onClick={onCheckoutOpen}
      >
        <Send aria-hidden="true" />
        Zakaz
      </button>
    </div>
  );
}
