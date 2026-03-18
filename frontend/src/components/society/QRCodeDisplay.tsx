'use client';

import QRCode from 'react-qr-code';
import { useRef, useEffect, useState } from 'react';

interface QRCodeDisplayProps {
  qr_token: string;
  eventTitle?: string;
}

export default function QRCodeDisplay({ qr_token, eventTitle }: QRCodeDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.log('QRCodeDisplay - qr_token:', qr_token);
    console.log('QRCodeDisplay - qr_token length:', qr_token?.length);
  }, [qr_token]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(qr_token.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) {
      console.error('SVG element not found');
      return;
    }

    // Clone the SVG to avoid modifying the original
    const svgClone = svg.cloneNode(true) as SVGElement;
    
    // Ensure SVG has proper dimensions
    const svgWidth = svg.clientWidth || 200;
    const svgHeight = svg.clientHeight || 200;
    svgClone.setAttribute('width', String(svgWidth));
    svgClone.setAttribute('height', String(svgHeight));

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgClone);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // Higher resolution
      canvas.width = svgWidth * scale;
      canvas.height = svgHeight * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Canvas context not available');
        URL.revokeObjectURL(url);
        return;
      }
      
      // Fill white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the QR code
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `entry-qr-${eventTitle ?? 'code'}.png`;
      a.click();
    };
    
    img.onerror = () => {
      console.error('Failed to load SVG image');
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };

  const handleDownloadSVG = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) {
      console.error('SVG element not found');
      return;
    }

    const svgClone = svg.cloneNode(true) as SVGElement;
    const svgWidth = svg.clientWidth || 200;
    const svgHeight = svg.clientHeight || 200;
    svgClone.setAttribute('width', String(svgWidth));
    svgClone.setAttribute('height', String(svgHeight));

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgClone);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `entry-qr-${eventTitle ?? 'code'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!qr_token || qr_token.trim() === '' ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Error: QR token is missing or empty
        </div>
      ) : (
        <>
          <div ref={containerRef} className="p-4 bg-white rounded-lg shadow-sm">
            <QRCode value={qr_token} size={200} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm text-gray-600 font-medium">
              Entry Code
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-gray-900 font-mono tracking-wider bg-gray-50 px-4 py-2 rounded border-2 border-gray-200">
                {qr_token.toUpperCase()}
              </div>
              <button
                onClick={handleCopyToken}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 transition-colors text-sm"
                title="Copy code"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <div className="text-xs text-gray-500">
              Show this QR code or code at the event entrance
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              Download PNG
            </button>
            <button
              onClick={handleDownloadSVG}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
            >
              Download SVG
            </button>
          </div>
        </>
      )}
    </div>
  );
}
