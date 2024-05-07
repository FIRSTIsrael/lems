import { Socket } from 'socket.io';
import {
  WSServerEmittedEvents,
  WSClientEmittedEvents,
  WSInterServerEvents,
  WSSocketData
} from '@lems/types';
import {
  handleStartSession,
  handleAbortSession,
  handleUpdateSession,
  handleUpdateSessionTeam,
  handleUpdateRubric,
  handleCreateCvForm,
  handleUpdateCvForm,
  handleCallLeadJudge
} from './handlers/judging';
import { handleRegisterTeam, handleCreateTicket, handleUpdateTicket } from './handlers/pit-admin';
import {
  handleAbortMatch,
  handleLoadMatch,
  handleUpdateMatchParticipant,
  handleUpdateMatchBrief,
  handleStartMatch,
  handleStartTestMatch,
  handleUpdateScoresheet,
  handleUpdateMatchTeams
} from './handlers/field';
import { handleUpdateAudienceDisplay, handleUpdatePresentation } from './handlers/audience-display';

const websocket = (
  socket: Socket<WSClientEmittedEvents, WSServerEmittedEvents, WSInterServerEvents, WSSocketData>
) => {
  const namespace = socket.nsp;
  const divisionId = socket.nsp.name.split('/')[2];

  console.log(`🔌 WS: Connection to division ${divisionId}`);

  socket.on('joinRoom', (rooms, callback) => {
    if (!Array.isArray(rooms)) rooms = [rooms];
    console.log(`🏠 WS: Joining rooms ${rooms.toString()}`);
    socket.join(rooms);
    callback({ ok: true });
  });

  socket.on('startJudgingSession', (...args) => handleStartSession(namespace, ...args));

  socket.on('abortJudgingSession', (...args) => handleAbortSession(namespace, ...args));

  socket.on('updateJudgingSessionTeam', (...args) => handleUpdateSessionTeam(namespace, ...args));

  socket.on('updateJudgingSession', (...args) => handleUpdateSession(namespace, ...args));

  socket.on('callLeadJudge', (...args) => handleCallLeadJudge(namespace, ...args));

  socket.on('updateRubric', (...args) => handleUpdateRubric(namespace, ...args));

  socket.on('createCvForm', (...args) => handleCreateCvForm(namespace, ...args));

  socket.on('updateCvForm', (...args) => handleUpdateCvForm(namespace, ...args));

  socket.on('registerTeam', (...args) => handleRegisterTeam(namespace, ...args));

  socket.on('createTicket', (...args) => handleCreateTicket(namespace, ...args));

  socket.on('updateTicket', (...args) => handleUpdateTicket(namespace, ...args));

  socket.on('loadMatch', (...args) => handleLoadMatch(namespace, ...args));

  socket.on('startMatch', (...args) => handleStartMatch(namespace, ...args));

  socket.on('startTestMatch', (...args) => handleStartTestMatch(namespace, ...args));

  socket.on('abortMatch', (...args) => handleAbortMatch(namespace, ...args));

  socket.on('updateMatchTeams', (...args) => handleUpdateMatchTeams(namespace, ...args));

  socket.on('updateMatchParticipant', (...args) =>
    handleUpdateMatchParticipant(namespace, ...args)
  );

  socket.on('updateMatchBrief', (...args) => handleUpdateMatchBrief(namespace, ...args));

  socket.on('updateScoresheet', (...args) => handleUpdateScoresheet(namespace, ...args));

  socket.on('updateAudienceDisplay', (...args) => handleUpdateAudienceDisplay(namespace, ...args));

  socket.on('updatePresentation', (...args) => handleUpdatePresentation(namespace, ...args));

  socket.on('disconnect', () => {
    console.log(`❌ WS: Disconnection from division ${divisionId}`);
  });
};

export default websocket;
