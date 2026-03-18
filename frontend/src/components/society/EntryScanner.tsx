'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useValidateQRMutation, useConfirmEntryMutation } from '@/lib/features/events/eventApiSlice';
import { FaTimes, FaQrcode, FaCheckCircle, FaExclamationCircle, FaUserCheck, FaCamera, FaUpload } from 'react-icons/fa';
import jsQR from 'jsqr';
import { Html5Qrcode } from 'html5-qrcode';

// ─── Props ───────────────────────────────────────────────────────────────────

interface EntryScannerProps {
    eventId: string;
    societyId: string;
    onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const EntryScanner: React.FC<EntryScannerProps> = ({ eventId: _eventId, societyId, onClose }) => {
    const [scannedToken, setScannedToken] = useState<string | null>(null);
    const [manualToken, setManualToken] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanMode, setScanMode] = useState<'camera' | 'upload'>('camera');
    const [isCameraActive, setIsCameraActive] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

    const [validateQR, { data: validateResult, isLoading: isValidating, reset: resetValidate }] =
        useValidateQRMutation();
    const [confirmEntry, { data: confirmResult, isLoading: isConfirming }] = useConfirmEntryMutation();

    // ─── Start Camera Scanner ────────────────────────────────────────────────

    const startCameraScanner = async () => {
        try {
            setImageError(null);
            setIsScanning(true);
            
            const html5QrCode = new Html5Qrcode("qr-reader");
            html5QrCodeRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" }, // Use back camera
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                async (decodedText) => {
                    // QR Code detected
                    console.log('QR Code detected:', decodedText);
                    const token = decodedText.trim().toLowerCase();
                    setScannedToken(token);
                    
                    // Stop scanning
                    await stopCameraScanner();
                    
                    // Validate the token
                    await validateQR({ qr_token: token, society_id: societyId });
                },
                (errorMessage) => {
                    // Scanning in progress, ignore errors
                }
            );

            setIsCameraActive(true);
            setIsScanning(false);
        } catch (err) {
            console.error('Camera error:', err);
            setImageError('Unable to access camera. Please check permissions or use upload mode.');
            setIsScanning(false);
            setIsCameraActive(false);
        }
    };

    // ─── Stop Camera Scanner ─────────────────────────────────────────────────

    const stopCameraScanner = async () => {
        if (html5QrCodeRef.current && isCameraActive) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current = null;
                setIsCameraActive(false);
            } catch (err) {
                console.error('Error stopping camera:', err);
            }
        }
    };

    // ─── Cleanup on unmount ───────────────────────────────────────────────────

    useEffect(() => {
        return () => {
            stopCameraScanner();
        };
    }, []);

    // ─── Switch scan mode ─────────────────────────────────────────────────────

    const handleScanModeChange = async (mode: 'camera' | 'upload') => {
        if (mode === 'upload' && isCameraActive) {
            await stopCameraScanner();
        }
        setScanMode(mode);
        setImageError(null);
        resetValidate();
        setScannedToken(null);
        setConfirmed(false);
    };

    // ─── Start camera when mode is camera ────────────────────────────────────

    useEffect(() => {
        if (scanMode === 'camera' && !isCameraActive && !scannedToken) {
            startCameraScanner();
        }
    }, [scanMode]);

    // ─── Decode QR from image file using jsQR ────────────────────────────────────────────

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageError(null);
        resetValidate();
        setScannedToken(null);
        setConfirmed(false);
        setIsScanning(true);

        try {
            // Read the image file
            const imageData = await readImageFile(file);
            
            // Decode QR code using jsQR
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code && code.data) {
                const token = code.data.trim().toLowerCase();
                console.log('Extracted QR token:', token);
                console.log('Token length:', token.length);
                setScannedToken(token);
                await validateQR({ qr_token: token, society_id: societyId });
            } else {
                setImageError('No QR code found in the image. Please ensure the QR code is clear and try again, or use manual entry below.');
            }
        } catch (error) {
            console.error('QR detection error:', error);
            setImageError('Failed to read QR code from image. Please try manual entry below.');
        } finally {
            setIsScanning(false);
        }

        // Reset file input so same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Helper function to read image file and convert to ImageData
    const readImageFile = (file: File): Promise<ImageData> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Could not get canvas context'));
                        return;
                    }
                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    resolve(imageData);
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    // ─── Manual token submit ──────────────────────────────────────────────────

    const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const token = manualToken.trim().toLowerCase(); // Convert to lowercase
        if (!token) return;

        resetValidate();
        setScannedToken(token);
        setConfirmed(false);
        await validateQR({ qr_token: token, society_id: societyId });
    };

    // ─── Confirm entry ────────────────────────────────────────────────────────

    const handleConfirmEntry = async () => {
        if (!scannedToken) return;
        try {
            await confirmEntry({ qr_token: scannedToken, society_id: societyId }).unwrap();
            setConfirmed(true);
        } catch {
            // error handled via confirmResult
        }
    };

    // ─── Reset to scan another ────────────────────────────────────────────────

    const handleReset = async () => {
        setScannedToken(null);
        setManualToken('');
        setConfirmed(false);
        setImageError(null);
        resetValidate();
        
        // Restart camera if in camera mode
        if (scanMode === 'camera') {
            await startCameraScanner();
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                        <FaQrcode className="text-orange-500 text-xl" />
                        <h2 className="text-lg font-semibold text-stone-800">Entry Scanner</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-lg hover:bg-stone-100"
                        aria-label="Close"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-5">
                    {/* Mode Selector */}
                    {!scannedToken && (
                        <div className="flex gap-2 bg-stone-100 p-1 rounded-lg">
                            <button
                                onClick={() => handleScanModeChange('camera')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                    scanMode === 'camera'
                                        ? 'bg-white text-orange-600 shadow-sm'
                                        : 'text-stone-600 hover:text-stone-800'
                                }`}
                            >
                                <FaCamera />
                                Live Camera
                            </button>
                            <button
                                onClick={() => handleScanModeChange('upload')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                    scanMode === 'upload'
                                        ? 'bg-white text-orange-600 shadow-sm'
                                        : 'text-stone-600 hover:text-stone-800'
                                }`}
                            >
                                <FaUpload />
                                Upload Image
                            </button>
                        </div>
                    )}

                    {/* Camera Scanner */}
                    {scanMode === 'camera' && !scannedToken && (
                        <div>
                            <p className="text-sm font-medium text-stone-600 mb-2">Point camera at QR code</p>
                            <div id="qr-reader" className="rounded-xl overflow-hidden border-2 border-stone-300"></div>
                            {isScanning && (
                                <div className="flex items-center justify-center py-3">
                                    <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                                    <span className="ml-2 text-sm text-stone-500">Starting camera...</span>
                                </div>
                            )}
                            {isCameraActive && (
                                <p className="mt-2 text-xs text-green-600 text-center">
                                    📷 Camera active - Point at QR code
                                </p>
                            )}
                        </div>
                    )}

                    {/* Upload Scanner */}
                    {scanMode === 'upload' && !scannedToken && (
                        <div>
                            <p className="text-sm font-medium text-stone-600 mb-2">Upload QR Code Image</p>
                            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                                <FaQrcode className="text-3xl text-stone-300 mb-1" />
                                <span className="text-sm text-stone-400">
                                    {isScanning ? 'Scanning...' : 'Click to upload QR image'}
                                </span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={isScanning}
                                />
                            </label>
                            {isScanning && (
                                <div className="flex items-center justify-center py-2 mt-2">
                                    <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                                    <span className="ml-2 text-sm text-stone-500">Reading QR code...</span>
                                </div>
                            )}
                        </div>
                    )}

                    {imageError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <FaExclamationCircle /> {imageError}
                        </p>
                    )}

                    {/* Divider */}
                    {!scannedToken && (
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-stone-200" />
                            <span className="text-xs text-stone-400 font-medium">or enter code manually</span>
                            <div className="flex-1 h-px bg-stone-200" />
                        </div>
                    )}

                    {/* Manual Token Entry */}
                    {!scannedToken && (
                        <form onSubmit={handleManualSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={manualToken}
                                onChange={(e) => setManualToken(e.target.value)}
                                placeholder="Enter 6-digit code (e.g., abc123)"
                                maxLength={6}
                                className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent uppercase"
                            />
                            <button
                                type="submit"
                                disabled={!manualToken.trim() || isValidating || manualToken.trim().length !== 6}
                                className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Validate
                            </button>
                        </form>
                    )}

                    {/* Validation Loading */}
                    {isValidating && (
                        <div className="flex items-center justify-center py-4">
                            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                            <span className="ml-2 text-sm text-stone-500">Validating...</span>
                        </div>
                    )}

                    {/* Validation Result */}
                    {validateResult && !isValidating && (
                        <div className="rounded-xl border overflow-hidden">
                            {validateResult.status === 'VALID' && (
                                <div className="bg-green-50 border-green-200">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-green-100 border-b border-green-200">
                                        <FaCheckCircle className="text-green-600" />
                                        <span className="text-sm font-semibold text-green-700">Valid QR Code</span>
                                    </div>
                                    <div className="px-4 py-3 space-y-1">
                                        {validateResult.student && (
                                            <>
                                                <p className="text-sm font-medium text-stone-800">{validateResult.student.name}</p>
                                                <p className="text-xs text-stone-500">{validateResult.student.email}</p>
                                                {validateResult.student.phone && (
                                                    <p className="text-xs text-stone-500">{validateResult.student.phone}</p>
                                                )}
                                            </>
                                        )}
                                        {validateResult.event && (
                                            <p className="text-xs text-orange-600 font-medium mt-1">{validateResult.event.title}</p>
                                        )}
                                    </div>
                                    <div className="px-4 pb-3">
                                        <button
                                            onClick={handleConfirmEntry}
                                            disabled={confirmed || isConfirming}
                                            className="w-full py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isConfirming ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Confirming...
                                                </>
                                            ) : confirmed || confirmResult?.status === 'CONFIRMED' ? (
                                                <>
                                                    <FaCheckCircle />
                                                    Entry Confirmed
                                                </>
                                            ) : (
                                                <>
                                                    <FaUserCheck />
                                                    Confirm Entry
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {validateResult.status === 'ALREADY_ENTERED' && (
                                <div className="bg-amber-50 border-amber-200">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-amber-100 border-b border-amber-200">
                                        <FaExclamationCircle className="text-amber-600" />
                                        <span className="text-sm font-semibold text-amber-700">Already Entered</span>
                                        <span className="ml-auto text-xs bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                            Already Entered
                                        </span>
                                    </div>
                                    <div className="px-4 py-3 space-y-1">
                                        {validateResult.student && (
                                            <>
                                                <p className="text-sm font-medium text-stone-800">{validateResult.student.name}</p>
                                                <p className="text-xs text-stone-500">{validateResult.student.email}</p>
                                                {validateResult.student.phone && (
                                                    <p className="text-xs text-stone-500">{validateResult.student.phone}</p>
                                                )}
                                            </>
                                        )}
                                        {validateResult.event && (
                                            <p className="text-xs text-orange-600 font-medium mt-1">{validateResult.event.title}</p>
                                        )}
                                        {validateResult.entry_confirmed_at && (
                                            <p className="text-xs text-stone-400 mt-1">
                                                Entered at: {new Date(validateResult.entry_confirmed_at).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {validateResult.status === 'INVALID_QR' && (
                                <div className="bg-red-50 border-red-200">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-red-100 border-b border-red-200">
                                        <FaExclamationCircle className="text-red-600" />
                                        <span className="text-sm font-semibold text-red-700">Invalid QR Code</span>
                                    </div>
                                    <div className="px-4 py-3">
                                        <p className="text-sm text-stone-600">This QR code is not valid for this event.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Scan Another button */}
                    {validateResult && !isValidating && (
                        <button
                            onClick={handleReset}
                            className="text-sm text-orange-500 hover:text-orange-600 font-medium underline underline-offset-2 self-center"
                        >
                            Scan another
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EntryScanner;
