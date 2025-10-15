import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Typography, Button, Container, TextField, Alert, Chip, Divider } from '@mui/material';

function RewardScan() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [usingCamera, setUsingCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const scanIntervalRef = useRef(null);

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

  useEffect(() => {
    // cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError('');
    if (usingCamera) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
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

      // polling scan loop every 700ms
      scanIntervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        if (detectorRef.current) {
          try {
            const barcodes = await detectorRef.current.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const codeValue = barcodes[0].rawValue;
              if (codeValue) {
                setCode(codeValue);
                // stop camera once code captured
                stopCamera();
              }
            }
          } catch (err) {
            // ignore detection errors
          }
        }
      }, 700);

      setUsingCamera(true);
    } catch (err) {
      setCameraError('Camera access denied or not available');
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
      }
    } catch (err) {
      // ignore cleanup errors
    }
    detectorRef.current = null;
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

              {cameraError && <Alert severity="warning" sx={{ mt: 2 }}>{cameraError}</Alert>}

              {usingCamera && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <video ref={videoRef} style={{ width: '100%', maxHeight: 360, borderRadius: 8 }} muted playsInline />
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

