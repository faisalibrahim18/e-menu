import React, { useRef } from "react";
import QrReader from "react-qr-scanner";

const QRScanner = () => {
  const qrReaderRef = useRef(null);

  const handleScan = (data) => {
    if (data) {
      console.log("Data dari QR Code:", data.text);
      window.open(data.text, "_blank");
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div>
      <QrReader
        ref={qrReaderRef}
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: "100%" }}
      />
      {/* Provide a link to the scanned URL using an anchor tag */}
      <a href={handleScan} target="_blank">
        Open Scanned URL
      </a>
    </div>
  );
};

export default QRScanner;
