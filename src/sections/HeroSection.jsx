import React from "react";
import { MapPin, Utensils } from "lucide-react";

export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="heroTitle">
      <div className="hero-bg" aria-hidden="true"></div>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <img className="hero-logo" src="/assets/logo.png" alt="Prime Fit logotipi" />
        <p className="eyebrow">Termiz bo'ylab yetkazib berish</p>
        <h1 id="heroTitle">PRIME FIT</h1>
        <p className="hero-copy">Kaloriya va oqsil miqdori ko'rsatilgan tayyor fit konteynerlar.</p>
        <div className="hero-actions">
          <a className="primary-button" href="#menu">
            <Utensils aria-hidden="true" />
            Menyudan tanlash
          </a>
          <a className="secondary-button" href="#order">
            <MapPin aria-hidden="true" />
            Zakaz berish
          </a>
        </div>
        <div className="hero-metrics" aria-label="Prime Fit ko'rsatkichlari">
          <span>
            <strong>360-735</strong> kcal
          </span>
          <span>
            <strong>31-58g</strong> oqsil
          </span>
          <span>
            <strong>Termiz</strong> ichida
          </span>
        </div>
      </div>
    </section>
  );
}
