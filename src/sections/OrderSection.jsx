import React from "react";
import { Send } from "lucide-react";
import { CartList } from "../components/CartList.jsx";
import { formatMoney } from "../utils/format.js";

export function OrderSection({
  cartItems,
  cartMacros,
  cartTotal,
  onClearCart,
  onCheckoutOpen,
  onUpdateQty,
}) {
  return (
    <section className="section order-section" id="order" aria-labelledby="orderTitle">
      <div className="section-head">
        <div>
          <p className="eyebrow">Zakaz qilish</p>
          <h2 id="orderTitle">Savat va yetkazish</h2>
        </div>
      </div>
      <div className="order-layout">
        <div className="glass order-panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">Savat</p>
              <h3>Tanlangan taomlar</h3>
            </div>
            <button className="text-button" type="button" onClick={onClearCart}>
              Tozalash
            </button>
          </div>
          <CartList cartItems={cartItems} onUpdateQty={onUpdateQty} />
          <div className={`cart-empty ${cartItems.length === 0 ? "is-visible" : ""}`}>
            Hali taom tanlanmadi
          </div>
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
            Zakazni rasmiylashtirish
          </button>
        </div>

        <div className="order-preview">
          <img src="/assets/meal-salmon-bowl.jpg" alt="Prime Fit fit konteyner taomi" />
          <div className="nutrition-strip glass">
            <span>Protein</span>
            <strong>{cartMacros.protein}g</strong>
            <span>Kcal</span>
            <strong>{cartMacros.kcal}</strong>
            <span>Massa</span>
            <strong>{cartMacros.mass}g</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
