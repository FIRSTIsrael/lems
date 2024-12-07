import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { DivisionWithEvent, SafeUser, RoleTypes, EventUserAllowedRoles } from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import Layout from '../../../components/layout';
import { getUserAndDivision, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { localizeDivisionTitle } from '../../../localization/event';
import DivisionDropdown from '../../../components/general/division-dropdown';
import { useNotes } from '../../../hooks/use-notes';
import { Button, Paper, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import FormikTextField from 'apps/frontend/components/general/forms/formik-text-field';
import { act } from 'react';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
}

const Page: NextPage<Props> = ({ user, division }) => {
  const router = useRouter();
  const { notes, addNote, updateNote, deleteNote } = useNotes();

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
        maxWidth="xl"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - פתקים | ${localizeDivisionTitle(division)}`}
        action={
          division.event.eventUsers.includes(user.role as EventUserAllowedRoles) && (
            <DivisionDropdown event={division.event} selected={division._id.toString()} />
          )
        }
        back={`/lems/reports`}
        color={division.color}
      >
        <Formik
          initialValues={{ text: '' }}
          onSubmit={(values, actions) => {
            addNote(values);
            actions.resetForm();
          }}
        >
          <Form>
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6">הוספת פתק</Typography>
              <FormikTextField name="text" label="טקסט" multiline />
              <Button variant="contained" type="submit">
                הוסף
              </Button>
            </Paper>
          </Form>
        </Formik>
        {notes.map(note => (
          <Paper key={note.id} sx={{ p: 2, mt: 2 }}>
            meep
          </Paper>
        ))}
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const { user, divisionId } = await getUserAndDivision(ctx);

    const data = await serverSideGetRequests(
      { division: `/api/divisions/${divisionId}?withEvent=true` },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
