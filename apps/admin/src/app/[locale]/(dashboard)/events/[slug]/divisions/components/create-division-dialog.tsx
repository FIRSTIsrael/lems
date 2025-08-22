'use client';

import { useTranslations } from 'next-intl';
import { Formik, Form, FormikHelpers } from 'formik';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormHelperText,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { ColorPicker, FormikTextField } from '@lems/shared';
import { HsvaColor, hsvaToHex, hexToHsva } from '@uiw/react-color';
import { apiFetch } from '../../../../../../../lib/fetch';
import { defaultColor } from '../../../../../../../theme';
import { useEvent } from '../../layout';

interface CreateDivisionModalProps {
  open: boolean;
  onClose: () => void;
  onDivisionCreated: () => void;
}

interface DivisionFormValues {
  name: string;
  color: HsvaColor;
}

interface DivisionFormErrors {
  name?: string;
  color?: string;
}

export const CreateDivisionDialog: React.FC<CreateDivisionModalProps> = ({
  open,
  onClose,
  onDivisionCreated
}) => {
  const event = useEvent();
  const t = useTranslations('pages.events.divisions.creation-dialog');

  const initialValues: DivisionFormValues = {
    name: '',
    color: hexToHsva(defaultColor)
  };

  const validateForm = (values: DivisionFormValues): DivisionFormErrors => {
    const errors: DivisionFormErrors = {};

    if (!values.name?.trim()) {
      errors.name = 'name-required';
    }

    return errors;
  };

  const handleSubmit = async (
    values: DivisionFormValues,
    { setSubmitting, setStatus }: FormikHelpers<DivisionFormValues>
  ) => {
    setSubmitting(true);
    setStatus(null);

    try {
      const result = await apiFetch(`/admin/events/${event.slug}/divisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          color: hsvaToHex(values.color)
        })
      });

      if (result.ok) {
        onDivisionCreated();
        onClose();
      } else {
        throw new Error();
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Formik initialValues={initialValues} validate={validateForm} onSubmit={handleSubmit}>
        {({ values, errors, touched, setFieldValue, status, isSubmitting, submitForm }) => (
          <>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogContent>
              <Form>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  <FormikTextField
                    name="name"
                    label={t('form.fields.name.label')}
                    error={touched.name && !!errors.name}
                    helperText={
                      touched.name && errors.name ? t(`form.errors.${errors.name}`) : undefined
                    }
                    placeholder={t('form.fields.name.placeholder')}
                    fullWidth
                    disabled={isSubmitting}
                  />

                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <ColorPicker
                        value={values.color}
                        onChange={color => setFieldValue('color', color)}
                      >
                        <IconButton
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: hsvaToHex(values.color),
                            border: '2px solid',
                            borderColor: 'divider',
                            '&:hover': {
                              backgroundColor: hsvaToHex(values.color),
                              opacity: 0.8,
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                          disabled={isSubmitting}
                          aria-label={t('form.fields.color.label')}
                        />
                      </ColorPicker>
                      <FormikTextField
                        name="colorDisplay"
                        label={t('form.fields.color.label')}
                        value={hsvaToHex(values.color)}
                        slotProps={{ input: { readOnly: true } }}
                        fullWidth
                        disabled={isSubmitting}
                      />
                    </Stack>
                    {errors.color && (
                      <FormHelperText error>{t(`form.errors.${errors.color}`)}</FormHelperText>
                    )}
                  </Stack>

                  {status && <Alert severity="error">{t(`form.errors.${status}`)}</Alert>}
                </Stack>
              </Form>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} disabled={isSubmitting}>
                {t('actions.cancel')}
              </Button>
              <Button
                onClick={submitForm}
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
              >
                {isSubmitting ? t('form.submitting') : t('actions.save')}
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};
