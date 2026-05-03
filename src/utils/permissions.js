export function requestStartupPermissions() {
  window.median_geolocation_ready = () => {
    requestGeolocation(() => {}, () => {});
  };

  const userAgent = navigator.userAgent || "";
  const isMedianIos = userAgent.includes("MedianIOS");
  const isMedianAndroid = userAgent.toLowerCase().includes("median") && /android/i.test(userAgent);

  if (isMedianAndroid && window.median?.android?.geoLocation?.promptLocationServices) {
    window.median.android.geoLocation.promptLocationServices();
    setTimeout(() => requestGeolocation(() => {}, () => {}), 600);
  } else if (!isMedianIos) {
    requestGeolocation(() => {}, () => {});
  }

  if (window.median?.permissions?.status) {
    window.median.permissions.status(["Notifications", "LocationWhenInUse"]).catch(() => {});
  }

  if ("Notification" in window && Notification.permission === "default") {
    Promise.resolve(Notification.requestPermission()).catch(() => {});
  }
}

export function requestGeolocation(onSuccess, onError) {
  if (!navigator.geolocation) {
    onError?.();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => onSuccess?.(position.coords),
    () => onError?.(),
    { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 },
  );
}
