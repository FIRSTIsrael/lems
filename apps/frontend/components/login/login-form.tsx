import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { WithId } from 'mongodb';
import { Button, Box, Typography, Stack, MenuItem, TextField } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {
  JudgingRoom,
  RobotGameTable,
  JudgingCategoryTypes,
  RoleTypes,
  Role,
  RoleAssociationType,
  getAssociationType,
  DivisionSectionTypes,
  Division,
  FllEvent
} from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import FormDropdown from './form-dropdown';
import { apiFetch } from '../../lib/utils/fetch';
import { createRecaptchaToken } from '../../lib/utils/captcha';
import { localizedRoles, localizedRoleAssociations } from '../../localization/roles';
import { localizedDivisionSection } from '../../localization/roles';
import { localizeDivisionTitle } from '../../localization/event';

interface Props {
  recaptchaRequired: boolean;
  event: WithId<FllEvent>;
  division: WithId<Division>;
  rooms: Array<WithId<JudgingRoom>>;
  tables: Array<WithId<RobotGameTable>>;
  onCancel: () => void;
}

const LoginForm: React.FC<Props> = ({
  recaptchaRequired,
  event,
  division,
  rooms,
  tables,
  onCancel
}) => {
  const [role, setRole] = useState<Role>('' as Role);
  const [password, setPassword] = useState<string>('');

  const [association, setAssociation] = useState<string>('');
  const associationType = useMemo<RoleAssociationType>(() => {
    let aType;
    if (role) {
      aType = getAssociationType(role);
    }
    return aType ? aType : ('' as RoleAssociationType);
  }, [role]);

  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const getDivisionAssociations = (type: RoleAssociationType) => {
    switch (type) {
      case 'table':
        return tables.map(table => {
          return { id: table._id, name: table.name };
        });
      case 'room':
        return rooms.map(room => {
          return { id: room._id, name: room.name };
        });
      case 'category':
        return JudgingCategoryTypes.map(category => {
          return { id: category, name: localizedJudgingCategory[category].name };
        });
      case 'section':
        return DivisionSectionTypes.map(section => {
          return { id: section, name: localizedDivisionSection[section].name };
        });
    }
  };

  const login = (captchaToken?: string) => {
    apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isAdmin: false,
        divisionId: division?._id,
        role,
        ...(association
          ? {
              roleAssociation: {
                type: associationType,
                value: association
              }
            }
          : undefined),
        password,
        ...(captchaToken ? { captchaToken } : {})
      })
    })
      .then(async res => {
        const data = await res.json();
        if (data && !data.error) {
          document.getElementById('recaptcha-script')?.remove();
          document.querySelector('.grecaptcha-badge')?.remove();
          const returnUrl = router.query.returnUrl || `/lems`;
          router.push(returnUrl as string);
        } else if (data.error) {
          if (data.error === 'INVALID_CREDENTIALS') {
            enqueueSnackbar('אופס, הסיסמה שגויה.', { variant: 'error' });
          } else {
            enqueueSnackbar('הגישה נדחתה, נסו שנית מאוחר יותר.', { variant: 'error' });
          }
        } else {
          throw new Error(res.statusText);
        }
      })
      .catch(() => enqueueSnackbar('אופס, החיבור לשרת נכשל.', { variant: 'error' }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    recaptchaRequired ? createRecaptchaToken().then(token => login(token)) : login();
  };

  return (
    <Stack direction="column" spacing={2} component="form" onSubmit={handleSubmit}>
      <Box justifyContent="flex-start" display="flex">
        <Button startIcon={<ChevronRightIcon />} onClick={onCancel}>
          לבחירת אירוע
        </Button>
      </Box>
      <Typography variant="h2" textAlign="center">
        התחברות לאירוע:
      </Typography>
      <Typography variant="h2" textAlign="center">
        {localizeDivisionTitle({ ...division, event })}
      </Typography>

      <FormDropdown
        id="select-division-role"
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
              {localizedRoles[r].name}
            </MenuItem>
          );
        })}
      </FormDropdown>

      {role && associationType && (
        <FormDropdown
          id="select-role-association"
          value={association}
          label={localizedRoleAssociations[associationType].name}
          onChange={e => setAssociation(e.target.value)}
        >
          {getDivisionAssociations(associationType).map(a => {
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
        <Button
          endIcon={<ChevronLeftIcon />}
          disabled={!role || !password || (!!associationType && !association)}
          type="submit"
          variant="contained"
        >
          התחבר
        </Button>
      </Box>
    </Stack>
  );
};

export default LoginForm;
