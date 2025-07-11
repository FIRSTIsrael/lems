import { useState } from 'react';
import { WithId } from 'mongodb';
import { useRouter } from 'next/router';
import {
  Alert,
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { DivisionWithEvent } from '@lems/types';
import { apiFetch } from '../../lib/utils/fetch';
import { localizeDivisionTitle } from '../../localization/event';
import { useTranslations } from 'next-intl';

interface DeleteDivisionDataProps {
  division: WithId<DivisionWithEvent>;
}

const DeleteDivisionData: React.FC<DeleteDivisionDataProps> = ({ division }) => {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const t = useTranslations('components:admin:delete-division-data');

  const handleConfirm = () => {
    apiFetch(`/api/admin/divisions/${division._id}/data`, {
      method: 'DELETE'
    }).then(() => {
      setOpen(false);
      router.reload();
    });
  };

  return (
    <>
      <Stack direction="row" justifyContent="center" spacing={2} mb={4}>
        <Alert
          severity="error"
          sx={{
            fontWeight: 500,
            maxWidth: '20rem',
            mx: 'auto',
            border: '1px solid #ff2f00'
          }}
        >
          {t('already-has-data')}
        </Alert>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteForeverIcon />}
          sx={{ borderRadius: '1rem' }}
          onClick={() => setOpen(true)}
        >
          {t('delete-event-data')}
        </Button>
      </Stack>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="delete-data-title"
        aria-describedby="delete-data-description"
      >
        <DialogTitle id="delete-data-title">{t('delete-event-data')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-data-description">
            {`אתם עומדים למחוק את כל נתוני האירוע, כולל תוצאות ופרסים מיום התחרות.
            פעולה זו אינה ניתנת לשחזור במקרה של טעות. אנא אשרו שברצונכם למחוק
            את כל המידע הקיים מאירוע "${localizeDivisionTitle(division)}".`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirm} autoFocus>
            {t('confirem')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteDivisionData;
