import { useState } from "react";

/**
 * Shows /logo.png (drop your school logo into frontend/public/logo.png) if it
 * exists. Falls back automatically to a plain "FU" badge if no logo file has
 * been added yet, so the app always looks correct either way.
 */
export default function Logo({ size = 40, className = "" }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!imgFailed) {
    return (
      <img
        src="/logo.png"
        alt="FULokoja Logo"
        onError={() => setImgFailed(true)}
        style={{ width: size, height: size }}
        className={`object-contain rounded-full ${className}`}
      />
    );
  }

  return (
    <span
      style={{ width: size, height: size }}
      className={`bg-university-gold text-university-dark rounded-full flex items-center justify-center font-bold ${className}`}
    >
      FU
    </span>
  );
}
