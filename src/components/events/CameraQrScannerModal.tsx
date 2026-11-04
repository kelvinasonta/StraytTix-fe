import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  Camera,
  CameraOff,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ScanLine,
  Keyboard,
  ShieldCheck,
  User,
  Ticket as TicketIcon,
  X
} from 'lucide-react';
import { soundEffects } from '../../utils/audio';
import type { TicketAttendee } from '../../types/api';

export interface ScanFeedback {
  status: 'success' | 'error' | 'already_checked' | 'reversed';
  message: string;
  attendee?: TicketAttendee | null;
  identifier?: string;
  timestamp: string;
}

interface CameraQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (identifier: string) => Promise<TicketAttendee>;
  onUndo?: (identifier: string) => Promise<TicketAttendee>;
  title?: string;
}

export const CameraQrScannerModal: React.FC<CameraQrScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  onUndo,
  title = 'Gate Ticket Scanner'
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);
  const [recentScans, setRecentScans] = useState<ScanFeedback[]>([]);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isHandlingScanRef = useRef(false);
  const lastScannedCodeRef = useRef<{ code: string; time: number } | null>(null);
  const containerId = 'eventsos-qr-reader-container';

  // Process code (from camera or manual input)
  const processIdentifier = async (rawCode: string) => {
    const code = rawCode.trim();
    if (!code || isProcessing) return;

    // Throttle identical rapid camera detections within 3.5 seconds
    const now = Date.now();
    if (
      lastScannedCodeRef.current &&
      lastScannedCodeRef.current.code.toUpperCase() === code.toUpperCase() &&
      now - lastScannedCodeRef.current.time < 3500
    ) {
      return;
    }
    lastScannedCodeRef.current = { code, time: now };

    setIsProcessing(true);
    try {
      const ticket = await onScan(code);
      soundEffects.playSuccess();
      const fb: ScanFeedback = {
        status: 'success',
        message: 'Valid Entry Granted',
        attendee: ticket,
        identifier: code,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setFeedback(fb);
      setRecentScans(prev => [fb, ...prev.slice(0, 19)]);
      setManualCode('');
    } catch (err: any) {
      soundEffects.playError();
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Invalid, cancelled, or already scanned ticket.';

      const isAlreadyChecked =
        typeof errorMsg === 'string' &&
        (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('checked in'));

      const fb: ScanFeedback = {
        status: isAlreadyChecked ? 'already_checked' : 'error',
        message: errorMsg,
        identifier: code,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setFeedback(fb);
      setRecentScans(prev => [fb, ...prev.slice(0, 19)]);
    } finally {
      setIsProcessing(false);
      isHandlingScanRef.current = false;
    }
  };

  // Undo / Reverse Check-in for an attendee
  const handleUndo = async (identifier: string) => {
    if (!onUndo || isProcessing) return;
    setIsProcessing(true);
    try {
      const ticket = await onUndo(identifier);
      soundEffects.playUndo();
      const fb: ScanFeedback = {
        status: 'reversed',
        message: 'Check-in reversed. Status set back to valid.',
        attendee: ticket,
        identifier,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setFeedback(fb);
      setRecentScans(prev => [fb, ...prev.slice(0, 19)]);
    } catch (err: any) {
      soundEffects.playError();
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to undo check-in.';
      setFeedback({
        status: 'error',
        message: errorMsg,
        identifier,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Start QR Camera Scanner
  const startScanner = async () => {
    setCameraError(null);
    try {
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
        } catch {
          // Ignore stop errors on unmounted instance
        }
      }

      // Check if element exists in DOM
      const elem = document.getElementById(containerId);
      if (!elem) {
        setTimeout(startScanner, 150);
        return;
      }

      const qrScanner = new Html5Qrcode(containerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39
        ],
        verbose: false
      });
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          if (!isHandlingScanRef.current) {
            isHandlingScanRef.current = true;
            processIdentifier(decodedText);
          }
        },
        () => {
          // Ignore frame parse misses
        }
      );
      setCameraActive(true);
    } catch (err: any) {
      console.warn('QR Camera initialization error:', err);
      setCameraActive(false);
      setCameraError(
        err?.message || 'Camera permission denied or camera unavailable. You can use manual ticket code input.'
      );
    }
  };

  // Stop QR Camera Scanner
  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch {
        // Safe catch
      }
      html5QrCodeRef.current = null;
    }
    setCameraActive(false);
  };

  // Manage scanner lifecycle on open / tab change
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      const timer = setTimeout(() => {
        startScanner();
      }, 200);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, activeTab]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#12121A] border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-150 dark:border-white/10 bg-zinc-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 text-[#E31B23] flex items-center justify-center">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white leading-tight">
                {title}
              </h3>
              <p className="text-xs text-zinc-500">Fast gate admission & barcode verification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers: Camera vs Manual Code Input */}
        <div className="flex border-b border-zinc-150 dark:border-white/10 px-6 pt-3 gap-4 bg-zinc-50/40 dark:bg-white/[0.01]">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'camera'
                ? 'border-[#E31B23] text-[#E31B23]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Camera className="w-4 h-4" />
            Live Camera Scanner
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'manual'
                ? 'border-[#E31B23] text-[#E31B23]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Manual Code / Search
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Active Tab: Live Camera Scanner */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative w-full aspect-square max-h-[300px] sm:max-h-[320px] mx-auto bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-zinc-800">
                {/* HTML5 QR Code Mount Div */}
                <div id={containerId} className="w-full h-full object-cover" />

                {/* Camera Error or Off fallback view */}
                {cameraError && (
                  <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center p-6 text-center text-zinc-300 space-y-3 z-20">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                      <CameraOff className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-white">Camera Unavailable</p>
                    <p className="text-xs text-zinc-400 max-w-xs">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => startScanner()}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Retry Camera
                    </button>
                  </div>
                )}

                {/* Live Scanning Guide Box Overlay */}
                {cameraActive && !cameraError && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                    <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(52,211,153,0.35)] animate-pulse">
                      <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-sm -mt-0.5 -ml-0.5" />
                      <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-sm -mt-0.5 -mr-0.5" />
                      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-sm -mb-0.5 -ml-0.5" />
                      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-sm -mb-0.5 -mr-0.5" />
                      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-400/70 shadow-[0_0_8px_#34d399]" />
                    </div>
                  </div>
                )}

                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-30">
                    <div className="flex items-center gap-3 bg-zinc-900/90 text-white px-5 py-3 rounded-2xl border border-zinc-700 shadow-xl">
                      <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                      <span className="text-sm font-bold tracking-wide">Verifying ticket...</span>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-center text-xs text-zinc-500">
                Point phone or webcam directly at attendee's digital QR or printed pass.
              </p>
            </div>
          )}

          {/* Active Tab: Manual Code Input */}
          {activeTab === 'manual' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                processIdentifier(manualCode);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Ticket Number, Order Reference, or QR Code Token
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. TKT-9821890, ORD-1234, or UUID"
                    className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl text-sm font-mono text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#E31B23]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!manualCode.trim() || isProcessing}
                    className="px-6 py-3 bg-[#E31B23] hover:bg-[#B91C1C] disabled:opacity-50 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Check In
                  </button>
                </div>
              </div>
              <p className="text-xs text-zinc-500">
                Type the alphanumeric ticket code displayed on the guest's ticket or confirmation email.
              </p>
            </form>
          )}

          {/* Real-time Visual Scan Feedback Banner */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                feedback.status === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-200'
                  : feedback.status === 'already_checked'
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-950 dark:text-amber-200'
                  : feedback.status === 'reversed'
                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50 text-blue-950 dark:text-blue-200'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-950 dark:text-red-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {feedback.status === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
                    {feedback.status === 'already_checked' && <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
                    {feedback.status === 'reversed' && <RotateCcw className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                    {feedback.status === 'error' && <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black tracking-tight">{feedback.message}</p>
                    {feedback.attendee ? (
                      <div className="text-xs space-y-0.5">
                        <p className="font-semibold flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 opacity-70" />
                          <span>{feedback.attendee.attendeeName || feedback.attendee.attendeeEmail || 'Guest'}</span>
                        </p>
                        <p className="opacity-80 flex items-center gap-1.5">
                          <TicketIcon className="w-3.5 h-3.5 opacity-70" />
                          <span>
                            {feedback.attendee.ticketType?.name || 'General Access'} • #{feedback.attendee.ticketNumber}
                          </span>
                        </p>
                      </div>
                    ) : (
                      feedback.identifier && (
                        <p className="text-xs font-mono opacity-80">Code: {feedback.identifier}</p>
                      )
                    )}
                  </div>
                </div>

                {/* Undo check-in button if check-in succeeded or is already checked */}
                {onUndo && (feedback.status === 'success' || feedback.status === 'already_checked') && (
                  <button
                    type="button"
                    onClick={() => handleUndo(feedback.attendee?.ticketNumber || feedback.attendee?.id || feedback.identifier || '')}
                    disabled={isProcessing}
                    className="flex-shrink-0 px-3 py-1.5 bg-white dark:bg-white/10 hover:bg-zinc-100 text-zinc-800 dark:text-white rounded-xl text-xs font-bold border border-zinc-200 dark:border-white/10 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reverse
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Recent Scans Session Log */}
          {recentScans.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-zinc-150 dark:border-white/10">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                <span>Recent Scans (Current Terminal Session)</span>
                <span>{recentScans.length} scans</span>
              </div>
              <div className="max-h-36 overflow-y-auto divide-y divide-zinc-100 dark:divide-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl bg-zinc-50/50 dark:bg-white/[0.01]">
                {recentScans.map((scan, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-zinc-100/50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          scan.status === 'success'
                            ? 'bg-emerald-500'
                            : scan.status === 'already_checked'
                            ? 'bg-amber-500'
                            : scan.status === 'reversed'
                            ? 'bg-blue-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {scan.attendee?.attendeeName || scan.identifier}
                      </span>
                      {scan.attendee?.ticketType?.name && (
                        <span className="text-[10px] text-zinc-400 truncate">
                          ({scan.attendee.ticketType.name})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-zinc-400 font-mono">{scan.timestamp}</span>
                      {onUndo && scan.status === 'success' && (
                        <button
                          type="button"
                          onClick={() => handleUndo(scan.attendee?.ticketNumber || scan.attendee?.id || scan.identifier || '')}
                          disabled={isProcessing}
                          className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 hover:text-red-500 underline cursor-pointer"
                        >
                          Undo
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraQrScannerModal;
