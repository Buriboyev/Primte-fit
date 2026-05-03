import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clearFirebaseOrders,
  deleteFirebaseOrder,
  isFirebaseConfigured,
  saveOrderToFirebase,
  subscribeToFirebaseOrders,
  updateFirebaseOrderStatus,
} from "./firebase.js";
import { CartDrawer } from "./components/CartDrawer.jsx";
import { CheckoutModal } from "./components/CheckoutModal.jsx";
import { Header } from "./components/Header.jsx";
import { AdminPanel } from "./sections/AdminPanel.jsx";
import { ShopPage } from "./sections/ShopPage.jsx";
import { products } from "./data/products.js";
import { useStoredState } from "./hooks/useStoredState.js";
import { createOrderId } from "./utils/format.js";
import { CART_KEY, loadOrders, saveOrders } from "./utils/storage.js";
import { requestStartupPermissions } from "./utils/permissions.js";
import { playOrderSound, unlockOrderSound } from "./utils/sound.js";

export default function App() {
  const [cart, setCart] = useStoredState(CART_KEY, []);
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState("shop");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [logoClicks, setLogoClicks] = useState(0);
  const [useCloudOrders, setUseCloudOrders] = useState(isFirebaseConfigured());
  const toastTimer = useRef();
  const knownOrderKeys = useRef(new Set());
  const hasLoadedOrders = useRef(false);

  const showToast = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  }, []);

  useEffect(() => {
    requestStartupPermissions();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("admin-body", view === "admin");
  }, [view]);

  useEffect(() => {
    if (!useCloudOrders) {
      setOrders(loadOrders());
      return undefined;
    }

    let isMounted = true;
    let unsubscribe;

    subscribeToFirebaseOrders(
      (nextOrders) => {
        if (isMounted) setOrders(nextOrders);
      },
      (error) => {
        console.error("Firebase orders listener failed", error);
        if (isMounted) {
          setUseCloudOrders(false);
          setOrders(loadOrders());
          showToast("Firebase o'qish xatosi. Local rejim yoqildi.");
        }
      },
    )
      .then((result) => {
        unsubscribe = result;
        if (!result && isMounted) {
          setUseCloudOrders(false);
          setOrders(loadOrders());
        }
      })
      .catch((error) => {
        console.error("Firebase setup failed", error);
        if (isMounted) {
          setUseCloudOrders(false);
          setOrders(loadOrders());
          showToast("Firebase ulanmagan. Local rejim yoqildi.");
        }
      });

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [showToast, useCloudOrders]);

  useEffect(() => {
    const orderKeys = orders.map((order) => order.firebaseId || order.id).filter(Boolean);
    const nextKnownKeys = new Set(orderKeys);

    if (!hasLoadedOrders.current) {
      knownOrderKeys.current = nextKnownKeys;
      hasLoadedOrders.current = true;
      return;
    }

    const hasNewOrder = orderKeys.some((orderKey) => !knownOrderKeys.current.has(orderKey));
    knownOrderKeys.current = nextKnownKeys;

    if (view === "admin" && hasNewOrder) {
      playOrderSound();
      showToast("Yangi zakaz keldi");
    }
  }, [orders, showToast, view]);

  const cartItems = useMemo(() => {
    return cart
      .map((entry) => {
        const product = products.find((item) => item.id === entry.id);
        return product ? { ...product, qty: entry.qty } : null;
      })
      .filter(Boolean);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cartItems]);

  const cartMacros = useMemo(() => {
    return cartItems.reduce(
      (totals, item) => ({
        kcal: totals.kcal + item.kcal * item.qty,
        protein: totals.protein + item.protein * item.qty,
        carbs: totals.carbs + item.carbs * item.qty,
        mass: totals.mass + item.mass * item.qty,
      }),
      { kcal: 0, protein: 0, carbs: 0, mass: 0 },
    );
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.qty, 0);
  }, [cartItems]);

  function addToCart(productId) {
    unlockOrderSound();
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    setCart((current) => {
      const existing = current.find((item) => item.id === productId);
      if (existing) {
        return current.map((item) =>
          item.id === productId ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...current, { id: productId, qty: 1 }];
    });
    showToast(`${product.name} savatga qo'shildi`);
  }

  function updateQty(productId, direction) {
    unlockOrderSound();
    setCart((current) => {
      return current
        .map((item) => (item.id === productId ? { ...item, qty: item.qty + direction } : item))
        .filter((item) => item.qty > 0);
    });
  }

  function handleLogoClick(event) {
    event.preventDefault();
    unlockOrderSound();
    const nextClicks = logoClicks + 1;
    setLogoClicks(nextClicks);

    if (nextClicks >= 5) {
      setView("admin");
      setLogoClicks(0);
      setCartOpen(false);
      setCheckoutOpen(false);
      showToast("Admin panel ochildi");
    }
  }

  async function submitOrder(payload) {
    await unlockOrderSound();
    const order = {
      id: createOrderId(),
      createdAt: new Date().toISOString(),
      status: "new",
      ...payload,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        kcal: item.kcal,
        protein: item.protein,
        mass: item.mass,
      })),
      total: cartTotal,
      macros: cartMacros,
    };

    if (useCloudOrders) {
      await saveOrderToFirebase(order);
    } else {
      const localOrders = loadOrders();
      localOrders.unshift(order);
      saveOrders(localOrders);
      setOrders(localOrders);
    }

    setCart([]);
    setCheckoutOpen(false);
    playOrderSound();
    showToast("Zakaz qabul qilindi. Admin panelda ko'rinadi.");
  }

  async function updateStatus(orderId, status) {
    if (useCloudOrders) {
      await updateFirebaseOrderStatus(orderId, status);
      return;
    }

    const nextOrders = loadOrders().map((order) =>
      order.id === orderId ? { ...order, status } : order,
    );
    saveOrders(nextOrders);
    setOrders(nextOrders);
  }

  async function deleteOrder(orderId) {
    if (useCloudOrders) {
      await deleteFirebaseOrder(orderId);
      showToast("Zakaz o'chirildi");
      return;
    }

    const nextOrders = loadOrders().filter((order) => order.id !== orderId);
    saveOrders(nextOrders);
    setOrders(nextOrders);
    showToast("Zakaz o'chirildi");
  }

  async function clearOrders() {
    if (!window.confirm("Hamma zakazlarni o'chirasizmi?")) return;

    if (useCloudOrders) {
      await clearFirebaseOrders();
      showToast("Zakazlar tozalandi");
      return;
    }

    saveOrders([]);
    setOrders([]);
    showToast("Zakazlar tozalandi");
  }

  function refreshOrders() {
    if (useCloudOrders) {
      showToast("Admin panel real-time rejimda ishlayapti.");
      return;
    }
    setOrders(loadOrders());
  }

  return (
    <>
      <Header
        cartCount={cartCount}
        isAdmin={view === "admin"}
        onCartOpen={() => {
          unlockOrderSound();
          setCartOpen(true);
        }}
        onLogoClick={handleLogoClick}
        onShop={() => setView("shop")}
      />

      {view === "admin" ? (
        <AdminPanel
          orders={orders}
          onClearOrders={clearOrders}
          onDeleteOrder={deleteOrder}
          onRefreshOrders={refreshOrders}
          onUpdateStatus={updateStatus}
        />
      ) : (
        <ShopPage
          cartItems={cartItems}
          cartMacros={cartMacros}
          cartTotal={cartTotal}
          onAddToCart={addToCart}
          onClearCart={() => setCart([])}
          onCheckoutOpen={() => {
            unlockOrderSound();
            setCheckoutOpen(true);
          }}
          onUpdateQty={updateQty}
        />
      )}

      <CartDrawer
        cartItems={cartItems}
        cartOpen={cartOpen}
        cartTotal={cartTotal}
        onCheckoutOpen={() => {
          unlockOrderSound();
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateQty}
      />

      {checkoutOpen ? (
        <CheckoutModal
          cartTotal={cartTotal}
          hasItems={cartItems.length > 0}
          onClose={() => setCheckoutOpen(false)}
          onSubmit={submitOrder}
          showToast={showToast}
        />
      ) : null}

      <div className={`toast ${toast ? "is-visible" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  );
}
