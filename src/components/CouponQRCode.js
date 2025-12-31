import React from 'react';
import QRCode from 'qrcode.react';
import { Box, Typography, Card, CardContent, Container, Chip } from '@mui/material';

function CouponQRCode({ code }) {
  if (!code) return null;
  return (
    <Box sx={{ textAlign: 'center', my: 2 }}>
      <QRCode value={code} size={180} level="H" includeMargin={true} />
      <Typography variant="body2" sx={{ mt: 1 }}>Scan this QR code to claim your free tea!</Typography>
      <Chip label={code} color="primary" sx={{ fontSize: 18, p: 1, mt: 1, fontWeight: 700, letterSpacing: 2 }} />
    </Box>
  );
}

export default CouponQRCode;
