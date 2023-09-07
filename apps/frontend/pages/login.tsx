import { useRouter } from 'next/router';
import {
  Avatar,
  Button,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
  Paper,
  Select,
  Stack,
  TextField
} from '@mui/material';
import { useMemo, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import EventIcon from '@mui/icons-material/EventOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {
  LoginPageResponse,
  LoginPageEvent,
  LoginRequest,
  JudgingCategoryTypes,
  RoleTypes,
  Role,
  RoleAssociationType,
  getAssociationType
} from '@lems/types';
import Layout from '../components/layout';
import { apiFetch } from '../lib/utils/fetch';
import { stringifyTwoDates } from '../lib/utils/dayjs';
import {
  localizeRole,
  localizeAssociationType,
  localizeJudgingCategory
} from '../lib/utils/localization';
import { getDivisionColor, getDivisionBackground } from '../lib/utils/colors';
import { useSnackbar } from 'notistack';

interface EventSelectorProps {
  events: LoginPageResponse;
  onChange: (event: LoginPageEvent) => void;
}

const EventSelector: React.FC<EventSelectorProps> = ({ events, onChange }) => {
  return (
    <Stack direction="column" spacing={2}>
      {events.map(event => {
        return (
          <ListItemButton
            key={event.name}
            onClick={() => onChange(event)}
            sx={{ borderRadius: 2 }}
            component="a"
            dense
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  color: getDivisionColor(event.color),
                  backgroundColor: getDivisionBackground(event.color)
                }}
              >
                <EventIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={event.name}
              secondary={stringifyTwoDates(event.startDate, event.endDate)}
            />
          </ListItemButton>
        );
      })}
    </Stack>
  );
};

interface EventLoginFormProps {
  event: LoginPageEvent;
  onBack: () => void;
}

const EventLoginForm: React.FC<EventLoginFormProps> = ({ event, onBack }) => {
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
        <Button startIcon={<ChevronRightIcon />} onClick={onBack}>
          לבחירת אירוע
        </Button>
      </Box>
      <Typography variant="h2" textAlign="center">
        התחברות לאירוע: {event.name}
      </Typography>

      <FormControl fullWidth>
        <InputLabel id="event-role-label">תפקיד</InputLabel>
        <Select
          labelId="event-role-label"
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
        </Select>
      </FormControl>
      {role && associationType && (
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel id="event-role-association">
            {localizeAssociationType(associationType).name}
          </InputLabel>
          <Select
            labelId="event-role-association"
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
          </Select>
        </FormControl>
      )}
      <TextField
        variant="outlined"
        type="password"
        label="סיסמה"
        value={password}
        onChange={e => setPassword(e.target.value)}
        fullWidth
        sx={{ mt: 1 }}
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

interface PageProps {
  events: LoginPageResponse;
}

const Page: NextPage<PageProps> = ({ events }) => {
  const [event, setEvent] = useState<LoginPageEvent | undefined>(undefined);

  return (
    <Layout maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        {event ? (
          <EventLoginForm
            event={event}
            onBack={() => {
              setEvent(undefined);
            }}
          />
        ) : (
          <EventSelector events={events} onChange={setEvent} />
        )}
      </Paper>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  return apiFetch('/public/pages/login')
    .then(response => response.json())
    .then((events: LoginPageResponse) => {
      return { props: { events } };
    });
};

export default Page;
