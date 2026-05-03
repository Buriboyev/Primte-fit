import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, LocateFixed, X } from "lucide-react";
import { formatMoney } from "../utils/format.js";
import { requestGeolocation } from "../utils/permissions.js";

const TERMIZ_CENTER = [37.2242, 67.2783];

export function CheckoutModal({ cartTotal, hasItems, onClose, onSubmit, showToast }) {
  const [selectedLocation, setSelectedLocation] = useState({
    lat: TERMIZ_CENTER[0],
    lng: TERMIZ_CENTER[1],
  });
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapElement = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  const setMapLocation = useCallback((lat, lng, shouldLookup) => {
    const nextLocation = {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
    };
    setSelectedLocation(nextLocation);

    if (markerInstance.current) {
      markerInstance.current.setLatLng([nextLocation.lat, nextLocation.lng]);
    }

    if (shouldLookup) {
      reverseLookup(nextLocation.lat, nextLocation.lng).then(setAddress);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then(({ default: L }) => {
      if (cancelled || !mapElement.current || mapInstance.current) return;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapElement.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(TERMIZ_CENTER, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker(TERMIZ_CENTER, { draggable: true }).addTo(map);
      marker.on("dragend", () => {
        const point = marker.getLatLng();
        setMapLocation(point.lat, point.lng, true);
      });
      map.on("click", (event) => setMapLocation(event.latlng.lat, event.latlng.lng, true));

      mapInstance.current = map;
      markerInstance.current = marker;

      setTimeout(() => map.invalidateSize(), 120);
    });

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
      }
    };
  }, [setMapLocation]);

  function useCurrentLocation() {
    requestGeolocation(
      ({ latitude, longitude }) => {
        if (mapInstance.current) {
          mapInstance.current.setView([latitude, longitude], 16);
        }
        setMapLocation(latitude, longitude, true);
      },
      () => showToast("Joylashuvga ruxsat berilmadi"),
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!hasItems) return;

    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);

    try {
      await onSubmit({
        customer: {
          name: String(form.get("name")).trim(),
          phone: String(form.get("phone")).trim(),
        },
        address: String(form.get("address")).trim(),
        note: String(form.get("note")).trim(),
        location: selectedLocation,
      });
    } catch (error) {
      console.error("Order submit failed", error);
      showToast("Zakaz yuborilmadi. Firebase sozlamasini tekshiring.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal is-open" aria-hidden="false" role="dialog" aria-labelledby="checkoutTitle">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-card glass">
        <div className="modal-head">
          <div>
            <p className="eyebrow">Yetkazish</p>
            <h3 id="checkoutTitle">Manzilni tanlang</h3>
          </div>
          <button className="icon-button ghost" type="button" aria-label="Modalni yopish" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </div>
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Ism
              <input name="name" type="text" autoComplete="name" placeholder="Masalan, Aziz" required />
            </label>
            <label>
              Telefon
              <input name="phone" type="tel" autoComplete="tel" placeholder="+998 90 123 45 67" required />
            </label>
          </div>
          <label>
            Manzil
            <input
              name="address"
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Xaritadan pin qo'ying yoki manzil yozing"
              required
            />
          </label>
          <div className="map-actions">
            <button className="secondary-button small" type="button" onClick={useCurrentLocation}>
              <LocateFixed aria-hidden="true" />
              Joylashuvim
            </button>
            <span>
              {selectedLocation.lat}, {selectedLocation.lng}
            </span>
          </div>
          <div ref={mapElement} className="map" aria-label="Yetkazish manzilini xaritada tanlash"></div>
          <label>
            Izoh
            <textarea name="note" rows="3" placeholder="Dom, podyezd, qavat yoki mo'ljal"></textarea>
          </label>
          <div className="checkout-bottom">
            <strong>{formatMoney(cartTotal)}</strong>
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              <Check aria-hidden="true" />
              Zakaz berish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

async function reverseLookup(lat, lng) {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lng);
    url.searchParams.set("accept-language", "uz");
    const response = await fetch(url.toString());
    const data = await response.json();
    return data.display_name || `${lat}, ${lng}`;
  } catch {
    return `${lat}, ${lng}`;
  }
}
