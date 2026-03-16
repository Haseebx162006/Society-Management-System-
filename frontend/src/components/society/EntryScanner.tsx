'use client';

import React, { useState, useRef } from 'react';
import { useValidateQRMutation, useConfirmEntryMutation } from '@/lib/features/events/eventApiSlice';
import { FaTimes, FaQrcode, FaCheckCircle, FaExclamationCircle, FaUserCheck } from 'react-icons/fa';

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

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [validateQR, { data: validateResult, isLoading: isValidating, reset: resetValidate }] =
        useValidateQRMutation();
    const [confirmEntry, { data: confirmResult, isLoading: isConfirming }] = useConfirmEntryMutation();

    // ─── Decode QR from image file ────────────────────────────────────────────

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageError(null);
        resetValidate();
        setScannedToken(null);
        setConfirmed(false);

        if ('BarcodeDetector' in window) {
            try {
                const bitmap = await createImageBitmap(file);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
                const barcodes = await detector.detect(bitmap);
                if (barcodes.length > 0) {
                    const token = barcodes[0].rawValue as string;
                    setScannedToken(token);
                    await validateQR({ qr_token: token, society_id: societyId });
                } else {
                    setImageError('No QR code found in the image. Please try manual entry.');
                }
            } catch {
                setImageError('Failed to read QR code. Please try manual entry.');
            }
        } else {
            setImageError('QR scanning not supported in this browser. Please use manual token entry below.');
        }

        // Reset file input so same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ─── Manual token submit ──────────────────────────────────────────────────

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = manualToken.trim();
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

    const handleReset = () => {
        setScannedToken(null);
        setManualToken('');
        setConfirmed(false);
        setImageError(null);
        resetValidate();
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
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
                    {/* QR Image Upload */}
                    <div>
                        <p className="text-sm font-medium text-stone-600 mb-2">Scan QR Code from Image</p>
                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                            <FaQrcode className="text-3xl text-stone-300 mb-1" />
                            <span className="text-sm text-stone-400">Click to upload QR image</span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                        {imageError && (
                            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                <FaExclamationCircle /> {imageError}
                            </p>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-stone-200" />
                        <span className="text-xs text-stone-400 font-medium">or enter token manually</span>
                        <div className="flex-1 h-px bg-stone-200" />
                    </div>

                    {/* Manual Token Entry */}
                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={manualToken}
                            onChange={(e) => setManualToken(e.target.value)}
                            placeholder="Paste QR token here..."
                            className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            disabled={!manualToken.trim() || isValidating}
                            className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Validate
                        </button>
                    </form>

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
