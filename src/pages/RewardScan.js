import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Typography, Button, Container, TextField, Alert, Chip, Divider } from '@mui/material';
import jsQR from 'jsqr';

function RewardScan() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [usingCamera, setUsingCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const scannedRef = useRef(false);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('/api/rewards/scan', { code });
      setResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to process code');
    } finally {
      setLoading(false);
    }
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 1000;
      g.gain.value = 0.1;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => { try { o.stop(); ctx.close(); } catch (e) {} }, 120);
    } catch (e) {
      // ignore audio errors
    }
  };

  const processDetectedCode = (codeValue) => {
    if (!codeValue) return;
    if (scannedRef.current) return;
    scannedRef.current = true;
    setCode(codeValue);
    playBeep();
    try { navigator.vibrate && navigator.vibrate(120); } catch (e) {}
    stopCamera();
    // submit directly using axios to avoid race with setCode
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.post('/api/rewards/scan', { code: codeValue });
        setResult(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to process code');
      } finally {
        setLoading(false);
      }
    })();
  };

  useEffect(() => {
    // cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError('');
    if (usingCamera) return;
    // quick support check
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera not supported in this browser');
      return;
    }
    try {
      // optional permission hint (may not be supported in all browsers)
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const p = await navigator.permissions.query({ name: 'camera' });
          if (p && p.state === 'denied') {
            setCameraError('Camera permission denied in browser settings');
            return;
          }
        }
      } catch (permErr) {
        // ignore permission query errors
      }

      // ask for a fairly high-res frame to improve detection
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // ensure attributes for autoplay on mobile
        videoRef.current.autoplay = true;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        try {
          // ensure this is called from a user gesture (button click) to avoid autoplay blocks
          const p = videoRef.current.play();
          if (p && p.then) p.catch(err => console.warn('video play rejected', err));
        } catch (playErr) {
          console.warn('video play failed', playErr);
        }
      }

      // Use native BarcodeDetector if available for QR/barcode scanning
      if ('BarcodeDetector' in window) {
        try {
          const formats = ['qr_code', 'ean_13', 'code_128'];
          detectorRef.current = new window.BarcodeDetector({ formats });
        } catch (err) {
          detectorRef.current = null;
        }
      }

      // polling scan loop every 300ms (faster) with BarcodeDetector or jsQR fallback
      scanIntervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        try {
          if (detectorRef.current) {
            // BarcodeDetector may accept ImageBitmap better in some browsers
            try {
              const maybeBitmap = typeof createImageBitmap === 'function' ? await createImageBitmap(videoRef.current) : null;
              const barcodes = maybeBitmap ? await detectorRef.current.detect(maybeBitmap) : await detectorRef.current.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const codeValue = barcodes[0].rawValue;
                if (codeValue) {
                  processDetectedCode(codeValue);
                }
              }
              if (maybeBitmap) try { maybeBitmap.close && maybeBitmap.close(); } catch (e) {}
            } catch (dErr) {
              console.warn('BarcodeDetector detect error, falling back', dErr);
            }
            return;
          }

          // jsQR fallback: draw current frame to canvas and scan
          const video = videoRef.current;
          let canvas = canvasRef.current;
          if (!canvas) {
            canvas = document.createElement('canvas');
            canvasRef.current = canvas;
          }
          const width = video.videoWidth || video.clientWidth;
          const height = video.videoHeight || video.clientHeight;
          if (width === 0 || height === 0) return; // not ready yet
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const codeObj = jsQR(imageData.data, width, height, { inversionAttempts: 'attemptBoth' });
          if (codeObj && codeObj.data) {
            processDetectedCode(codeObj.data);
          }
        } catch (err) {
          // capture camera errors and show to user
          console.warn('scan loop error', err);
          setCameraError((err && err.message) || String(err));
        }
      }, 300);

      setUsingCamera(true);
    } catch (err) {
      const msg = (err && (err.name ? `${err.name}: ${err.message}` : err.message)) || String(err);
      setCameraError(msg || 'Camera access denied or not available');
      console.warn('getUserMedia error', err);
    }
  };

  const stopCamera = () => {
    try {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(t => t.stop());
        videoRef.current.srcObject = null;
        // remove src attributes to free device on some browsers
        try { videoRef.current.pause(); } catch (e) {}
        try { videoRef.current.removeAttribute('src'); } catch (e) {}
      }
    } catch (err) {
      // ignore cleanup errors
    }
    detectorRef.current = null;
    if (canvasRef.current) {
      try { canvasRef.current.width = 0; canvasRef.current.height = 0; } catch (e) {}
      canvasRef.current = null;
    }
    setUsingCamera(false);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Scan Reward / Claim Coupon
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Enter Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                margin="normal"
                required
              />

              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {!usingCamera ? (
                  <Button variant="outlined" onClick={startCamera}>Use Camera to Scan</Button>
                ) : (
                  <Button variant="outlined" color="secondary" onClick={stopCamera}>Stop Camera</Button>
                )}
                <Button variant="text" onClick={() => { setCode(''); setResult(null); setError(''); }}>Clear</Button>
              </Box>

              {cameraError && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="warning">{cameraError}</Alert>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button variant="outlined" onClick={() => { setCameraError(''); startCamera(); }}>Retry Camera</Button>
                    <Button variant="text" onClick={() => { setUsingCamera(false); stopCamera(); }}>Stop</Button>
                  </Box>
                </Box>
              )}

              {usingCamera && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <video ref={videoRef} style={{ width: '100%', maxHeight: 360, borderRadius: 8 }} muted playsInline autoPlay />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>Point your camera at a QR or barcode. Camera will stop after a successful scan.</Typography>
                </Box>
              )}

              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
                {loading ? 'Processing...' : 'Submit'}
              </Button>
            </form>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            <Divider sx={{ my: 2 }}>OR</Divider>

            {result && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="success">Code processed successfully!</Alert>
                <Typography component="pre" variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</Typography>
                {result.code && <Typography variant="body2">Code: <b>{result.code}</b></Typography>}
                {result.station && <Typography variant="body2">Station: {result.station}</Typography>}
                {result.used && <Chip label="Used" color="success" sx={{ mt: 2 }} />}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default RewardScan;

