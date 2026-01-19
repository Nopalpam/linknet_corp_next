'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Language as IpIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '@/lib/axios';

interface ContactDetailModalProps {
  open: boolean;
  onClose: () => void;
  submissionId: string;
}

interface SubmissionDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  company?: string;
  inquiryType: 'BUSINESS' | 'SUPPORT' | 'CAREER' | 'OTHERS';
  message: string;
  status: 'NEW' | 'READ';
  ipAddress?: string;
  userAgent?: string;
  submittedAt: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  open,
  onClose,
  submissionId,
}) => {
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && submissionId) {
      fetchSubmissionDetail();
    }
  }, [open, submissionId]);

  const fetchSubmissionDetail = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(`/cms/contactus/${submissionId}`);

      if (response.data.success) {
        setSubmission(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch submission details');
      console.error('Error fetching submission:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInquiryTypeColor = (type: string) => {
    switch (type) {
      case 'BUSINESS':
        return 'primary';
      case 'SUPPORT':
        return 'warning';
      case 'CAREER':
        return 'success';
      case 'OTHERS':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Contact Submission Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : submission ? (
          <Stack spacing={3}>
            {/* Status Badge */}
            <Box>
              <Chip
                label={submission.status}
                color={submission.status === 'NEW' ? 'primary' : 'default'}
                size="medium"
              />
            </Box>

            {/* Personal Information */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                PERSONAL INFORMATION
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PersonIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1">
                        {submission.firstName} {submission.lastName}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmailIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">{submission.email}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                {submission.phone && (
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">{submission.phone}</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                )}
                {submission.role && (
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Role
                        </Typography>
                        <Typography variant="body1">{submission.role}</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                )}
                {submission.company && (
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <BusinessIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Company
                        </Typography>
                        <Typography variant="body1">{submission.company}</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Inquiry Information */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                INQUIRY DETAILS
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary">
                  Inquiry Type
                </Typography>
                <Box mt={0.5}>
                  <Chip
                    label={submission.inquiryType}
                    color={getInquiryTypeColor(submission.inquiryType) as any}
                    size="small"
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Message
                </Typography>
                <Box
                  mt={1}
                  p={2}
                  sx={{
                    backgroundColor: 'background.default',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                    {submission.message}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Metadata */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                SUBMISSION METADATA
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Submitted At
                      </Typography>
                      <Typography variant="body2">
                        {format(new Date(submission.submittedAt), 'PPpp')}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                {submission.readAt && (
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Read At
                        </Typography>
                        <Typography variant="body2">
                          {format(new Date(submission.readAt), 'PPpp')}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                )}
                {submission.ipAddress && (
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IpIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          IP Address
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {submission.ipAddress}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                )}
                {submission.userAgent && (
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        User Agent
                      </Typography>
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        fontSize="0.75rem"
                        sx={{
                          wordBreak: 'break-all',
                          color: 'text.secondary',
                        }}
                      >
                        {submission.userAgent}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactDetailModal;
