'use client';

import QRCode from 'react-qr-code';
import { useRef } from 'react';

interface QRCodeDisplayProps {
  qr_token: string;
  eventTitle?: string;
}

export default function QRCodeDisplay({ qr_token, eventTitle }: QRCodeDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 200;
      canvas.height = img.height || 200;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `entry-qr-${eventTitle ?? 'code'}.png`;
      a.click();
    };
    img.src = url;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={containerRef}>
        <QRCode value={qr_token} size={200} />
      </div>
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Download as PNG
      </button>
    </div>
  );
}
