import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Form, Formik } from 'formik';
import { enqueueSnackbar } from 'notistack';
import { green } from '@mui/material/colors';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EditOffOutlinedIcon from '@mui/icons-material/EditOffOutlined';
import { DivisionWithEvent, SafeUser, RoleTypes, Team } from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import Layout from '../../../components/layout';
import { getUserAndDivision, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { localizeDivisionTitle } from '../../../localization/event';
import FormikTextField from '../../../components/general/forms/formik-text-field';
import { Note, useNotes } from '../../../hooks/use-notes';
import FormikTeamField from '../../../components/general/forms/formik-team-field';
import { localizeTeam } from '../../../localization/teams';

interface ViewingNoteProps {
  note: Note;
  updateNote: (note: Note) => Promise<void>;
}

const ViewingNote: React.FC<ViewingNoteProps> = ({ note, updateNote }) => {
  return (
    <>
      {note.title && (
        <Typography fontSize="1.25rem" fontWeight={600}>
          {note.title}
        </Typography>
      )}
      {note.team && (
        <Typography fontSize="1rem" fontWeight={500}>
          {localizeTeam(note.team)}
        </Typography>
      )}
      <Typography sx={{ whiteSpace: 'pre-line', mt: 1 }}>{note.text}</Typography>
      <FormControlLabel
        sx={{ mt: 2 }}
        control={
          <Checkbox
            checked={note.done}
            onChange={() => updateNote({ ...note, done: !note.done })}
          />
        }
        label="טופל"
      />
    </>
  );
};

interface EditingNoteProps {
  teams: Array<WithId<Team>>;
  note: Note;
  updateNote: (note: Note) => Promise<void>;
}

const EditingNote: React.FC<EditingNoteProps> = ({ teams, note, updateNote }) => {
  return (
    <Formik
      initialValues={{ ...note }}
      onSubmit={values => {
        const { title, text, team } = values;
        const newNote: Note = { ...note, title, text, team, editing: false };
        updateNote(newNote);
      }}
    >
      <Form>
        <Stack spacing={1} width="85%" marginBottom={1}>
          <FormikTextField name="title" label="כותרת" fullWidth />
          <FormikTeamField name="team" teams={teams} fullWidth />
          <FormikTextField name="text" label="תיאור" multiline minRows={3} />
        </Stack>
        <Button variant="contained" type="submit">
          שמירה
        </Button>
      </Form>
    </Formik>
  );
};

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  teams: Array<WithId<Team>>;
}

const Page: NextPage<Props> = ({ user, division, teams }) => {
  const router = useRouter();
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const initialValues: { text: string; title: string; team: WithId<Team> | null } = {
    text: '',
    title: '',
    team: null
  };

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - פתקים | ${localizeDivisionTitle(division)}`}
        user={user}
        division={division}
        back="/lems/reports"
        color={division.color}
      >
        <Formik
          initialValues={initialValues}
          onSubmit={(values, actions) => {
            const { title, text, team } = values;
            const note: Note = { title, text, team, done: false };
            addNote(note);
            actions.resetForm();
          }}
        >
          <Form>
            <Stack component={Paper} spacing={2} sx={{ p: 2, mt: 2 }}>
              <Typography fontSize="1.5rem" fontWeight={600}>
                הוספת פתק
              </Typography>
              <Stack direction="row" spacing={2}>
                <FormikTextField name="title" label="כותרת" fullWidth />
                <FormikTeamField name="team" teams={teams} fullWidth />
              </Stack>
              <FormikTextField name="text" label="תיאור" multiline minRows={3} />
              <Button variant="contained" type="submit">
                הוסף
              </Button>
            </Stack>
          </Form>
        </Formik>
        <Grid container>
          {notes
            .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
            .map(note => (
              <Grid
                size={12}
                component={Paper}
                key={note.id}
                py={2}
                px={3}
                mt={2}
                sx={{ backgroundColor: note.done ? green[100] : undefined }}
              >
                <Box position="relative">
                  <IconButton
                    sx={{ position: 'absolute', top: 0, right: 0 }}
                    onClick={() => updateNote({ ...note, editing: !note.editing })}
                  >
                    {note.editing ? <EditOffOutlinedIcon /> : <EditOutlinedIcon />}
                  </IconButton>
                  <IconButton
                    sx={{ position: 'absolute', bottom: 0, right: 0 }}
                    onClick={() => note.id && deleteNote(note.id)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                  {note.editing ? (
                    <EditingNote teams={teams} note={note} updateNote={updateNote} />
                  ) : (
                    <ViewingNote note={note} updateNote={updateNote} />
                  )}
                </Box>
              </Grid>
            ))}
        </Grid>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const { user, divisionId } = await getUserAndDivision(ctx);

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${divisionId}?withEvent=true`,
        teams: `/api/divisions/${divisionId}/teams`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
