'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSWR, { mutate } from 'swr';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { FileUpload, apiFetch } from '@lems/shared';
import { Division } from '@lems/types/api/admin';

interface RegisterTeamsCSVResult {
  registered: Array<{ name: string; number: number; division: { name: string; color: string } }>;
  skipped: Array<{ name: string; number: number; reason: string }>;
}

interface RegisterTeamsFromCSVDialogProps {
  close: () => void;
  eventId: string;
}

const RegisterForm: React.FC<{
  eventId: string;
  divisions: Division[];
  onSuccess: (result: RegisterTeamsCSVResult) => void;
}> = ({ eventId, divisions, onSuccess }) => {
  const t = useTranslations('pages.events.teams.register-from-csv-dialog.form');
  const registrationT = useTranslations('pages.events.teams.registration-dialog');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(() => {
    const available = divisions.filter(division => !division.hasSchedule);
    if (available.length > 1) {
      return 'random';
    }
    return available[0]?.id || null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMultipleDivisions = divisions.length > 1;
  const availableDivisions = divisions.filter(division => !division.hasSchedule);

  const handleSubmit = async () => {
    if (!selectedFile || !selectedDivisionId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append(
        'divisionId',
        selectedDivisionId === 'random' ? 'random' : selectedDivisionId
      );

      const result = await apiFetch(`/admin/events/${eventId}/teams/register-from-csv`, {
        method: 'POST',
        body: formData
      });

      if (result.ok) {
        mutate(`/admin/events/${eventId}/teams`);
        mutate(`/admin/events/${eventId}/teams/available`);
        onSuccess(result.data as RegisterTeamsCSVResult);
      } else {
        if (result.status === 400) {
          setError('invalid-file');
        } else {
          setError('upload-error');
        }
      }
    } catch {
      setError('upload-error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" mb={1}>
          <Box pt={0.33}>
            <InfoIcon color="primary" />
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('instructions.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('instructions.description')}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          {t('instructions.csv-format')}
        </Typography>
        <List dense>
          <ListItem disablePadding>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('instructions.requirements.header')}
              slotProps={{ primary: { variant: 'body2' } }}
            />
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('instructions.requirements.columns')}
              slotProps={{ primary: { variant: 'body2' } }}
            />
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('instructions.requirements.encoding')}
              slotProps={{ primary: { variant: 'body2' } }}
            />
          </ListItem>
        </List>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          {t('instructions.example')}
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
          <Typography variant="body2" component="pre" dir="ltr" sx={{ whiteSpace: 'pre-wrap' }}>
            {`1234
5678
9999`}
          </Typography>
        </Paper>
      </Paper>

      {hasMultipleDivisions && (
        <FormControl fullWidth>
          <InputLabel>{registrationT('division')}</InputLabel>
          <Select
            value={selectedDivisionId || ''}
            label={registrationT('division')}
            onChange={e => setSelectedDivisionId(e.target.value)}
          >
            {availableDivisions.length > 1 && (
              <MenuItem value="random">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                      border: '2px solid currentColor'
                    }}
                  />
                  {registrationT('random')}
                </Box>
              </MenuItem>
            )}
            {divisions.map(division => (
              <MenuItem key={division.id} value={division.id} disabled={division.hasSchedule}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: division.color
                    }}
                  />
                  {division.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <FileUpload
        label={t('fields.file.label')}
        accept=".csv,text/csv"
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        description={t('fields.file.description')}
        disabled={isSubmitting}
        placeholder={t('fields.file.placeholder')}
      />

      {error && <Alert severity="error">{t(`errors.${error}`)}</Alert>}

      <Stack direction="row" justifyContent="center">
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          disabled={!selectedFile || (!selectedDivisionId && hasMultipleDivisions) || isSubmitting}
          sx={{ minWidth: 200 }}
        >
          {isSubmitting ? t('uploading') : t('upload')}
        </Button>
      </Stack>
    </Stack>
  );
};

const SuccessView: React.FC<{
  result: RegisterTeamsCSVResult;
  onClose: () => void;
  hasMultipleDivisions: boolean;
}> = ({ result, onClose, hasMultipleDivisions }) => {
  const t = useTranslations('pages.events.teams.register-from-csv-dialog.success');

  return (
    <Stack spacing={3} alignItems="center">
      <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />

      <Typography variant="h6" textAlign="center">
        {t('title')}
      </Typography>

      {result.registered.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t('registered', { count: result.registered.length })}
          </Typography>
          <List dense>
            {result.registered.slice(0, 5).map(team => (
              <ListItem key={team.number} disablePadding>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {hasMultipleDivisions && (
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: team.division.color,
                        flexShrink: 0
                      }}
                    />
                  )}
                  <ListItemText
                    primary={`#${team.number} - ${team.name}`}
                    slotProps={{ primary: { variant: 'body2' } }}
                  />
                </Box>
              </ListItem>
            ))}
            {result.registered.length > 5 && (
              <ListItem disablePadding>
                <ListItemText
                  primary={t('and-more', { count: result.registered.length - 5 })}
                  slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }}
                />
              </ListItem>
            )}
          </List>
        </Box>
      )}

      {result.skipped.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t('skipped', { count: result.skipped.length })}
          </Typography>
          <List dense>
            {result.skipped.slice(0, 5).map(team => (
              <ListItem key={team.number} disablePadding>
                <ListItemText
                  primary={`#${team.number} - ${team.name}`}
                  secondary={t(`skip-reasons.${team.reason}`)}
                  slotProps={{
                    primary: { variant: 'body2' },
                    secondary: { variant: 'body2' }
                  }}
                />
              </ListItem>
            ))}
            {result.skipped.length > 5 && (
              <ListItem disablePadding>
                <ListItemText
                  primary={t('and-more', { count: result.skipped.length - 5 })}
                  slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }}
                />
              </ListItem>
            )}
          </List>
        </Box>
      )}

      <Button variant="contained" onClick={onClose} sx={{ minWidth: 200 }}>
        {t('close')}
      </Button>
    </Stack>
  );
};

export const RegisterTeamsFromCSVDialog: React.FC<RegisterTeamsFromCSVDialogProps> = ({
  close,
  eventId
}) => {
  const t = useTranslations('pages.events.teams.register-from-csv-dialog');
  const [result, setResult] = useState<RegisterTeamsCSVResult | null>(null);

  const { data: divisions = [], isLoading: divisionsLoading } = useSWR<Division[]>(
    `/admin/events/${eventId}/divisions`
  );

  const handleSuccess = (result: RegisterTeamsCSVResult) => {
    setResult(result);
  };

  return (
    <>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent
        sx={{ minWidth: 600, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        {divisionsLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress size={60} />
          </Box>
        ) : result ? (
          <SuccessView
            result={result}
            onClose={close}
            hasMultipleDivisions={divisions.length > 1}
          />
        ) : (
          <RegisterForm eventId={eventId} divisions={divisions} onSuccess={handleSuccess} />
        )}
      </DialogContent>
      {!result && (
        <DialogActions>
          <Button onClick={close}>{t('actions.cancel')}</Button>
        </DialogActions>
      )}
    </>
  );
};
