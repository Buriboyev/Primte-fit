import React from "react";
import { Plus } from "lucide-react";
import { formatMoney } from "../utils/format.js";

export function ProductCard({ product, onAddToCart }) {
  return (
    <article className="product-card">
      <img src={product.image} alt={`${product.name} fit konteyneri`} loading="lazy" />
      <div className="product-body">
        <div className="product-top">
          <div>
            <span className="product-category">{product.category}</span>
            <h3 className="product-title">{product.name}</h3>
          </div>
          <strong className="product-price">{formatMoney(product.price)}</strong>
        </div>
        <p className="product-note">{product.note}</p>
        <div className="macro-row" aria-label={`${product.name} nutrientlari`}>
          <span>{product.mass}g</span>
          <span>{product.kcal} kcal</span>
          <span>{product.protein}g oqsil</span>
          <span>{product.carbs}g uglevod</span>
        </div>
        <button className="primary-button small full" type="button" onClick={() => onAddToCart(product.id)}>
          <Plus aria-hidden="true" />
          Savatga
        </button>
      </div>
    </article>
  );
}
