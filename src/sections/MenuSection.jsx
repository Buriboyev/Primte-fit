import React from "react";
import { ProductCard } from "../components/ProductCard.jsx";
import { products } from "../data/products.js";

export function MenuSection({ onAddToCart }) {
  return (
    <section className="section menu-section" id="menu" aria-labelledby="menuTitle">
      <div className="section-head">
        <div>
          <p className="eyebrow">GFDiet ilhomida</p>
          <h2 id="menuTitle">Kengaytirilgan menyu</h2>
        </div>
        <p className="section-note">Mass, kcal va oqsil qiymatlari o'rtacha porsiya bo'yicha.</p>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
}
