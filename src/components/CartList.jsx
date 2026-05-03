import React from "react";
import { formatMoney } from "../utils/format.js";

export function CartList({ cartItems, compact = false, onUpdateQty }) {
  return (
    <div className={`cart-list ${compact ? "compact" : ""}`}>
      {cartItems.map((item) => (
        <div className="cart-item" key={item.id}>
          <div className="cart-info">
            <strong>{item.name}</strong>
            <span>
              {formatMoney(item.price)} x {item.qty}
            </span>
          </div>
          <div className="qty" aria-label={`${item.name} miqdori`}>
            <button type="button" aria-label="Kamaytirish" onClick={() => onUpdateQty(item.id, -1)}>
              -
            </button>
            <span>{item.qty}</span>
            <button type="button" aria-label="Ko'paytirish" onClick={() => onUpdateQty(item.id, 1)}>
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
