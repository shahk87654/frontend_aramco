import React, { useEffect, useState } from 'react';
import axios from 'axios';
import normalizeStations from '../utils/stationUtils';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  Container,
  Snackbar,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Card,
  Grid,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as ExcelJS from 'exceljs';

function AdminCouponStats() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState(new Date());
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') return navigate('/admin-login');
    const token = localStorage.getItem('token');
    axios
      .get('/api/stations', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setStations(normalizeStations(res.data)))
      .catch(() => setError('Failed to load stations'));
  }, []);

  const fetchStats = () => {
    const token = localStorage.getItem('token');
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    if (startDate > endDate) {
      setError('Start date must be before end date');
      return;
    }

    setLoading(true);
    const formatDate = (d) => d.toISOString().split('T')[0];
    const params = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
    if (selectedStation) {
      params.stationId = selectedStation;
    }

    axios
      .get('/api/admin/coupons-stats', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setStats(Array.isArray(res.data) ? res.data : res.data.data || []);
        setSuccess('Stats loaded successfully');
      })
      .catch(() => setError('Failed to load coupon statistics'))
      .finally(() => setLoading(false));
  };

  const exportToExcel = async () => {
    if (stats.length === 0) {
      setError('No data to export');
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Coupon Statistics');

      // Add title and date range info
      const titleRow = worksheet.addRow(['Coupon Statistics Report']);
      titleRow.font = { bold: true, size: 14 };
      titleRow.getCell(1).alignment = { horizontal: 'center' };
      worksheet.mergeCells('A1:H1');

      const dateRangeRow = worksheet.addRow([
        `Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      ]);
      dateRangeRow.getCell(1).alignment = { horizontal: 'center' };
      worksheet.mergeCells('A2:H2');

      worksheet.addRow([]); // Empty row

      // Add headers
      const headers = [
        'Station Name',
        'Total Coupons',
        'Used',
        'Unused',
        'Manual',
        'Review-Based',
        'Utilisation Rate (%)',
        'Date Range',
      ];
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };

      // Add data rows
      stats.forEach((stat) => {
        worksheet.addRow([
          stat.stationName || stat.station?.name || '-',
          stat.totalCoupons || 0,
          stat.used || 0,
          stat.unused || 0,
          stat.manual || 0,
          stat.reviewBased || 0,
          (stat.utilisationRate || 0).toFixed(2),
          `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        ]);
      });

      // Add totals row
      const totals = calculateTotals();
      const totalRow = worksheet.addRow([
        'TOTAL',
        totals.totalCoupons,
        totals.used,
        totals.unused,
        totals.manual,
        totals.reviewBased,
        totals.utilisationRate.toFixed(2),
        '',
      ]);
      totalRow.font = { bold: true };
      totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECF0F1' } };

      // Adjust column widths
      worksheet.columns = [
        { width: 25 },
        { width: 15 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 15 },
        { width: 18 },
        { width: 20 },
      ];

      // Generate filename
      const filename = `Coupon_Statistics_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Save file
      await workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentElement.removeChild(link);
        window.URL.revokeObjectURL(url);
      });

      setSuccess('File exported successfully');
    } catch (err) {
      setError('Failed to export file');
    }
  };

  const calculateTotals = () => {
    const totals = {
      totalCoupons: 0,
      used: 0,
      unused: 0,
      manual: 0,
      reviewBased: 0,
      utilisationRate: 0,
    };

    stats.forEach((stat) => {
      totals.totalCoupons += stat.totalCoupons || 0;
      totals.used += stat.used || 0;
      totals.unused += stat.unused || 0;
      totals.manual += stat.manual || 0;
      totals.reviewBased += stat.reviewBased || 0;
    });

    // Calculate average utilisation rate
    if (stats.length > 0) {
      totals.utilisationRate =
        (stats.reduce((sum, stat) => sum + (stat.utilisationRate || 0), 0) / stats.length);
    }

    return totals;
  };

  const totals = calculateTotals();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ bgcolor: 'linear-gradient(135deg, #e0e7ff 0%, #f5f6fa 100%)', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: '#1976d2', mb: 4 }}
            align="center"
          >
            Coupon Statistics Dashboard
          </Typography>

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  label="Station (Optional)"
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">All Stations</MenuItem>
                  {(Array.isArray(stations) ? stations : []).map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={fetchStats}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Load Stats'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Summary Totals */}
          {stats.length > 0 && (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2, boxShadow: 2 }}>
                  <Typography color="textSecondary" variant="small">
                    Total Coupons
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {totals.totalCoupons}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2, boxShadow: 2 }}>
                  <Typography color="textSecondary" variant="small">
                    Used
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {totals.used}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2, boxShadow: 2 }}>
                  <Typography color="textSecondary" variant="small">
                    Unused
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {totals.unused}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2, boxShadow: 2 }}>
                  <Typography color="textSecondary" variant="small">
                    Utilisation Rate
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                    {totals.utilisationRate.toFixed(2)}%
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Export Button */}
          {stats.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<FileDownloadIcon />}
                onClick={exportToExcel}
              >
                Export to Excel
              </Button>
            </Box>
          )}

          {/* Data Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : stats.length > 0 ? (
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#1976d2' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Station Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">
                      Total Coupons
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">
                      Used
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">
                      Unused
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">
                      Manual
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">
                      Review-Based
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">
                      Utilisation Rate (%)
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Date Range</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.map((stat, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell>{stat.stationName || stat.station?.name || '-'}</TableCell>
                      <TableCell align="right">{stat.totalCoupons || 0}</TableCell>
                      <TableCell align="right">{stat.used || 0}</TableCell>
                      <TableCell align="right">{stat.unused || 0}</TableCell>
                      <TableCell align="right">{stat.manual || 0}</TableCell>
                      <TableCell align="right">{stat.reviewBased || 0}</TableCell>
                      <TableCell align="right">{(stat.utilisationRate || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow sx={{ backgroundColor: '#ecf0f1', fontWeight: 700 }}>
                    <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {totals.totalCoupons}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {totals.used}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {totals.unused}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {totals.manual}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {totals.reviewBased}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {totals.utilisationRate.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No data available. Try adjusting your filters.
              </Typography>
            </Paper>
          )}

          <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
            <Alert severity="success">{success}</Alert>
          </Snackbar>
          <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')}>
            <Alert severity="error">{error}</Alert>
          </Snackbar>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}

export default AdminCouponStats;
