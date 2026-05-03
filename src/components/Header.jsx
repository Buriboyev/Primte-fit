import React from "react";
import { ShoppingBag } from "lucide-react";

export function Header({ cartCount, isAdmin, onCartOpen, onLogoClick, onShop }) {
  return (
    <header className="site-header glass">
      <a className="brand" href="#top" aria-label="Prime Core maxfiy admin tugmasi" onClick={onLogoClick}>
        <img src="/assets/logo.png" alt="Prime Core" />
        <span>{isAdmin ? "Admin" : "Prime Core"}</span>
      </a>
      <nav className="nav-links" aria-label="Asosiy menyu">
        {isAdmin ? (
          <>
            <button className="nav-button" type="button" onClick={onShop}>
              Sayt
            </button>
            <a href="#orders">Zakazlar</a>
          </>
        ) : (
          <>
            <a href="#menu">Menyu</a>
            <a href="#order">Zakaz</a>
          </>
        )}
      </nav>
      <button className="icon-button" type="button" aria-label="Savatni ochish" onClick={onCartOpen}>
        <ShoppingBag aria-hidden="true" />
        <span id="cartBadge">{cartCount}</span>
      </button>
    </header>
  );
}
