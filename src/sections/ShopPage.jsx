import React from "react";
import { HeroSection } from "./HeroSection.jsx";
import { MenuSection } from "./MenuSection.jsx";
import { OrderSection } from "./OrderSection.jsx";

export function ShopPage({
  cartItems,
  cartMacros,
  cartTotal,
  onAddToCart,
  onClearCart,
  onCheckoutOpen,
  onUpdateQty,
}) {
  return (
    <main id="top">
      <HeroSection />
      <MenuSection onAddToCart={onAddToCart} />
      <OrderSection
        cartItems={cartItems}
        cartMacros={cartMacros}
        cartTotal={cartTotal}
        onClearCart={onClearCart}
        onCheckoutOpen={onCheckoutOpen}
        onUpdateQty={onUpdateQty}
      />
    </main>
  );
}
