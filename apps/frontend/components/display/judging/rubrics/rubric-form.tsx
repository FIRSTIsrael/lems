import React, { useEffect, useRef } from 'react';
import { WithId } from 'mongodb';
import { useSnackbar } from 'notistack';
import { Form, Formik, FormikContextType } from 'formik';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/router';
import { Socket } from 'socket.io-client';
import {
  Alert,
  Button,
  Grid,
  Stack,
  SxProps,
  Table,
  TableBody,
  TableHead,
  Theme,
  Typography
} from '@mui/material';
import { purple } from '@mui/material/colors';
import FeedbackNote from './feedback-note';
import RatingRow from './rating-row';
import HeaderRow from './header-row';
import TitleRow from './title-row';
import AwardCandidatureCheckbox from './award-candidature-checkbox';
import { RoleAuthorizer } from '../../../role-authorizer';
import { RubricsSchema } from '../../../../localization/rubric-schemas';
import {
  Event,
  SafeUser,
  Team,
  Rubric,
  RubricStatus,
  JudgingCategory,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';

interface Props {
  event: WithId<Event>;
  team: WithId<Team>;
  rubric: WithId<Rubric<JudgingCategory>>;
  // schema: RubricsSchema;
  // user: WithId<SafeUser>;
  // socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
  // hideTitle?: boolean;
  // hideDescription?: boolean;
}

const RubricForm: React.FC<Props> = ({
  // schema,
  event,
  team,
  rubric
  // team,
  // data,
  // user,
  // socket,
  // hideTitle = false,
  // hideDescription = false
}) => {
  return (
    <>
      <Typography>{JSON.stringify(rubric)}</Typography>
    </>
  );
};

export default RubricForm;
