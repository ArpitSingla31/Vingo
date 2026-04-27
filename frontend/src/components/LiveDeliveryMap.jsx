import React from "react";

const hasCoords = (point) =>
  Number.isFinite(point?.lat) && Number.isFinite(point?.lng);

const buildEmbedUrl = (point) => {
  if (!hasCoords(point)) {
    return null;
  }

  return `https://maps.google.com/maps?q=${point.lat},${point.lng}&z=15&output=embed`;
};

const buildOpenMapUrl = (point) => {
  if (hasCoords(point)) {
    return `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`;
  }

  if (point?.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      point.address
    )}`;
  }

  return null;
};

const LiveDeliveryMap = ({ order }) => {
  const shopPoint = {
    key: "shop",
    label: "Restaurant",
    lat: order?.shopLocation?.lat,
    lng: order?.shopLocation?.lng,
    address: order?.shopLocation?.address,
  };

  const customerPoint = {
    key: "customer",
    label: "Customer",
    lat: order?.customerLocation?.lat,
    lng: order?.customerLocation?.lng,
    address: order?.customerLocation?.address,
  };

  const riderPoint = {
    key: "rider",
    label: "Delivery Boy",
    lat: order?.deliveryPartnerLocation?.lat,
    lng: order?.deliveryPartnerLocation?.lng,
    address: order?.deliveryPartnerLocation?.address,
  };

  const primaryMapPoint = hasCoords(riderPoint)
    ? riderPoint
    : hasCoords(customerPoint)
      ? customerPoint
      : shopPoint;

  const embedUrl = buildEmbedUrl(primaryMapPoint);
  const points = [shopPoint, customerPoint, riderPoint];

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-500">
            Live Tracking
          </p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">
            Delivery movement
          </h3>
        </div>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
          {order?.status?.replaceAll("_", " ")}
        </span>
      </div>

      <div className="relative h-72 overflow-hidden rounded-[24px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_35%),linear-gradient(135deg,_#fff7ed,_#ffffff_55%,_#f8fafc)]">
        {embedUrl ? (
          <iframe
            title="Live delivery map"
            src={embedUrl}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-slate-500">
            Share location from the delivery dashboard to activate live tracking for this order.
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {points.map((point) => {
          const url = buildOpenMapUrl(point);

          return (
            <div
              key={point.key}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {point.label}
              </p>
              <p className="mt-2 min-h-10 text-sm text-slate-700">
                {point.address || "Location pending"}
              </p>
              {hasCoords(point) && (
                <p className="mt-1 text-xs text-slate-500">
                  {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                </p>
              )}
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-orange-600"
                >
                  Open in Google Maps
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveDeliveryMap;
