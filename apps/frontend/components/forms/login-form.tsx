import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { Button, Box, Typography, Stack, MenuItem, TextField } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {
  LoginPageEvent,
  LoginRequest,
  JudgingCategoryTypes,
  RoleTypes,
  Role,
  RoleAssociationType,
  getAssociationType
} from '@lems/types';
import FormDropdown from './form-dropdown';
import { apiFetch } from '../../lib/utils/fetch';
import {
  localizeRole,
  localizeAssociationType,
  localizeJudgingCategory
} from '../../lib/utils/localization';

interface LoginFormProps {
  event: LoginPageEvent;
  onCancel: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ event, onCancel }) => {
  const [role, setRole] = useState<Role>('' as Role);
  const [password, setPassword] = useState<string>('');

  const [association, setAssociation] = useState<string>('');
  const associationType = useMemo<RoleAssociationType>(() => {
    return role ? getAssociationType(role) : ('' as RoleAssociationType);
  }, [role]);

  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const getEventAssociations = (type: RoleAssociationType) => {
    switch (type) {
      case 'table':
        return event.tables.map(table => {
          return { id: table._id, name: table.name };
        });
      case 'room':
        return event.rooms.map(room => {
          return { id: room._id, name: room.name };
        });
      case 'category':
        return JudgingCategoryTypes.map(category => {
          return { id: category, name: localizeJudgingCategory(category).name };
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: event?._id,
        role,
        ...(association
          ? {
              association: {
                type: associationType,
                id: association
              }
            }
          : {}),
        password
      } as LoginRequest)
    })
      .then(async res => {
        const data = await res.json();
        if (data.token) {
          const returnUrl = router.query.returnUrl || `/event/${event._id}`;
          router.push(returnUrl as string);
        } else if (data.error === 'INVALID_CREDENTIALS') {
          enqueueSnackbar('אופס, הסיסמה שגויה.', { variant: 'error' });
        } else {
          throw new Error(res.statusText);
        }
      })
      .catch(() => enqueueSnackbar('אופס, החיבור לשרת נכשל.', { variant: 'error' }));
  };

  return (
    <Stack direction="column" spacing={2} component="form" onSubmit={handleSubmit}>
      <Box justifyContent="flex-start" display="flex">
        <Button startIcon={<ChevronRightIcon />} onClick={onCancel}>
          לבחירת אירוע
        </Button>
      </Box>
      <Typography variant="h2" textAlign="center">
        התחברות לאירוע: {event.name}
      </Typography>

      <FormDropdown
        id="select-event-role"
        value={role}
        label="תפקיד"
        onChange={e => {
          setRole(e.target.value as Role);
          setAssociation('');
        }}
      >
        {RoleTypes.map((r: Role) => {
          return (
            <MenuItem value={r} key={r}>
              {localizeRole(r).name}
            </MenuItem>
          );
        })}
      </FormDropdown>

      {role && associationType && (
        <FormDropdown
          id="select-role-association"
          value={association}
          label={localizeAssociationType(associationType).name}
          onChange={e => setAssociation(e.target.value)}
        >
          {getEventAssociations(associationType).map(a => {
            return (
              <MenuItem value={a.id.toString()} key={a.id.toString()}>
                {a.name}
              </MenuItem>
            );
          })}
        </FormDropdown>
      )}
      <TextField
        fullWidth
        variant="outlined"
        type="password"
        label="סיסמה"
        value={password}
        onChange={e => setPassword(e.target.value)}
        inputProps={{ dir: 'ltr' }}
      />

      <Box justifyContent="flex-end" display="flex" pt={4}>
        <Button endIcon={<ChevronLeftIcon />} type="submit" variant="contained">
          התחבר
        </Button>
      </Box>
    </Stack>
  );
};

export default LoginForm;
