import React, { useState } from "react";
import {
  Car,
  Download,
  Map,
  MapPin,
  Navigation,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { statusLabels } from "../data/products.js";
import { formatDate, formatMoney, isToday } from "../utils/format.js";

export function AdminPanel({ orders, onClearOrders, onDeleteOrder, onRefreshOrders, onUpdateStatus }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredOrders = orders.filter((order) =>
    statusFilter === "all" ? true : order.status === statusFilter,
  );
  const todayCount = orders.filter(isToday).length;
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  function exportOrders() {
    const data = JSON.stringify(orders, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prime-fit-orders-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="admin-main" id="orders">
      <section className="admin-hero">
        <div>
          <p className="eyebrow">Prime Fit</p>
          <h1>Zakazlar paneli</h1>
        </div>
        <div className="admin-actions">
          <button className="secondary-button small" type="button" onClick={onRefreshOrders}>
            <RefreshCw aria-hidden="true" />
            Yangilash
          </button>
          <button className="secondary-button small" type="button" onClick={exportOrders}>
            <Download aria-hidden="true" />
            JSON
          </button>
          <button className="secondary-button danger small" type="button" onClick={onClearOrders}>
            <Trash2 aria-hidden="true" />
            Tozalash
          </button>
        </div>
      </section>

      <section className="admin-stats" aria-label="Zakaz statistikasi">
        <div className="stat-card glass">
          <span>Jami</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="stat-card glass">
          <span>Bugun</span>
          <strong>{todayCount}</strong>
        </div>
        <div className="stat-card glass">
          <span>Tushum</span>
          <strong>{formatMoney(revenue)}</strong>
        </div>
      </section>

      <section className="glass admin-panel">
        <div className="admin-panel-head">
          <h2>Hamma zakazlar</h2>
          <select
            aria-label="Status bo'yicha filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">Hammasi</option>
            <option value="new">Yangi</option>
            <option value="preparing">Tayyorlanmoqda</option>
            <option value="delivered">Yetkazildi</option>
          </select>
        </div>
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.firebaseId || order.id}
              order={order}
              onDeleteOrder={onDeleteOrder}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </div>
        <div className={`cart-empty admin-empty ${filteredOrders.length === 0 ? "is-visible" : ""}`}>
          Hali zakaz yo'q
        </div>
      </section>
    </main>
  );
}

function OrderCard({ order, onDeleteOrder, onUpdateStatus }) {
  const lat = order.location?.lat;
  const lng = order.location?.lng;
  const orderKey = order.firebaseId || order.id;
  const googleUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const yandexUrl = `https://yandex.com/maps/?ll=${lng}%2C${lat}&z=17&pt=${lng}%2C${lat}%2Cpm2rdm`;
  const yandexGoUrl = `yandextaxi://route?end-lat=${lat}&end-lon=${lng}`;

  return (
    <article className="order-card" data-order={orderKey}>
      <div className="order-card-head">
        <div>
          <h3>{order.id || orderKey}</h3>
          <div className="order-meta">
            <span>{formatDate(order.createdAt)}</span>
            <span>{order.customer?.name || ""}</span>
            <span>{order.customer?.phone || ""}</span>
          </div>
        </div>
        <span className="status-pill">{statusLabels[order.status] || order.status}</span>
      </div>
      <div className="order-grid">
        <div>
          <a className="order-address" href={googleUrl} target="_blank" rel="noreferrer">
            <MapPin aria-hidden="true" />
            <span>{order.address || `${lat}, ${lng}`}</span>
          </a>
          <div className="order-items">
            {(order.items || []).map((item) => (
              <span key={`${orderKey}-${item.id}`}>
                {item.qty} x {item.name} ({item.protein}g oqsil)
              </span>
            ))}
          </div>
          {order.note ? <p className="order-note">{order.note}</p> : null}
        </div>
        <div className="order-side">
          <strong>{formatMoney(order.total || 0)}</strong>
          <select
            aria-label={`${order.id || orderKey} statusi`}
            value={order.status}
            onChange={(event) => onUpdateStatus(orderKey, event.target.value)}
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <div className="map-links">
            <a href={googleUrl} target="_blank" rel="noreferrer">
              <Map aria-hidden="true" />
              Google
            </a>
            <a href={yandexUrl} target="_blank" rel="noreferrer">
              <Navigation aria-hidden="true" />
              Yandex
            </a>
            <a href={yandexGoUrl}>
              <Car aria-hidden="true" />
              Yandex Go
            </a>
          </div>
          <button className="secondary-button danger small" type="button" onClick={() => onDeleteOrder(orderKey)}>
            <Trash2 aria-hidden="true" />
            O'chirish
          </button>
        </div>
      </div>
    </article>
  );
}
