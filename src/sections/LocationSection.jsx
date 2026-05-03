import React from "react";
import { MapPin, Navigation } from "lucide-react";

export function LocationSection() {
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Prime%20Fit%20Termiz";

  return (
    <section className="section location-section" id="location" aria-labelledby="locationTitle">
      <div className="location-layout">
        <div className="location-media">
          <img src="/assets/storefront.png" alt="Prime Core Termiz do'koni fasadi" />
        </div>
        <div className="location-copy glass">
          <p className="eyebrow">Termizdagi Prime Core</p>
          <h2 id="locationTitle">Real do'kon. Tez yetkazish.</h2>
          <p>
            Buyurtmani xaritadan tanlaysiz. Termiz ichida fit
            konteynerlar tayyor holda yetkaziladi.
          </p>
          <a className="primary-button" href={mapsUrl} target="_blank" rel="noreferrer">
            <Navigation aria-hidden="true" />
            Xaritada ochish
          </a>
          <span className="location-pin">
            <MapPin aria-hidden="true" />
            Prime Core, Termiz
          </span>
        </div>
      </div>
    </section>
  );
}
