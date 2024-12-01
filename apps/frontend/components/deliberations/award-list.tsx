import { ObjectId, WithId } from 'mongodb';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Team, AwardNames } from '@lems/types';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { errorAnimation } from '../../lib/utils/animations';

interface AwardListItemProps {
  droppableId: string;
  team: WithId<Team>;
  index: number;
  shouldPlayErrorAnimation: boolean;
  disabled?: boolean;
}

const AwardListItem: React.FC<AwardListItemProps> = ({
  droppableId,
  team,
  index,
  shouldPlayErrorAnimation,
  disabled = false
}) => {
  return (
    <Draggable
      key={droppableId + ':' + team._id}
      draggableId={droppableId + ':' + team._id}
      index={index}
      isDragDisabled={disabled}
    >
      {(provided, snapshot) => (
        <div ref={provided.innerRef} style={{ width: '100%' }}>
          <Paper
            sx={{
              border: shouldPlayErrorAnimation
                ? ''
                : `1px ${snapshot.isDragging ? 'dashed' : 'solid'} #ccc`,
              borderRadius: 1,
              minHeight: 35,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              animation: shouldPlayErrorAnimation
                ? `${errorAnimation} 1s linear infinite alternate`
                : ''
            }}
            {...provided.dragHandleProps}
            {...provided.draggableProps}
            style={provided.draggableProps.style}
          >
            {typeof team === 'string' ? team : team.number}
          </Paper>
        </div>
      )}
    </Draggable>
  );
};

interface SuggestedTeamItem {
  team: WithId<Team>;
  addTeam: (teamId: ObjectId) => void;
  disabled?: boolean;
}

const SuggestedTeamItem: React.FC<SuggestedTeamItem> = ({ team, addTeam, disabled }) => {
  return (
    <Stack
      width="100%"
      minHeight={35}
      alignItems="center"
      justifyContent="space-evenly"
      sx={{ border: '1px dashed #999' }}
      borderRadius={1}
      direction="row"
    >
      <Typography width="100%" textAlign="center">
        {team.number}
      </Typography>
      <IconButton onClick={() => addTeam(team._id)} sx={{ height: 33, width: 33 }}>
        <AddCircleOutlineIcon />
      </IconButton>
    </Stack>
  );
};

interface AwardListProps {
  pickList: Array<WithId<Team>>;
  id: AwardNames;
  disabled?: boolean;
  withIcons?: boolean;
  trophyCount?: number;
  length: number;
  title?: string;
  fullWidth?: boolean;
  suggestedTeam?: WithId<Team> | null;
  addSuggestedTeam?: (teamId: ObjectId) => void;
}

const AwardList: React.FC<AwardListProps> = ({
  pickList,
  id,
  disabled = false,
  withIcons = false,
  trophyCount = 0,
  length,
  title,
  fullWidth = false,
  suggestedTeam,
  addSuggestedTeam
}) => {
  const awardIcons = [
    <EmojiEventsIcon key={'1'} fontSize="large" sx={{ color: '#fecb4d', ml: 3 }} />,
    <EmojiEventsIcon key={'2'} fontSize="large" sx={{ color: '#788991', ml: 3 }} />,
    <EmojiEventsIcon key={'3'} fontSize="large" sx={{ color: '#a97d4f', ml: 3 }} />,
    <WorkspacePremiumIcon key={'4'} fontSize="large" sx={{ color: '#5ebad9', ml: 3 }} />
  ];

  return (
    <Paper sx={{ p: 2, height: '100%', width: fullWidth ? '100%' : undefined }}>
      {title && (
        <Typography align="center" fontWeight={500} gutterBottom>
          {title}
        </Typography>
      )}
      <Grid container width="100%">
        <Grid size={9}>
          <Droppable key={id} droppableId={id}>
            {(provided, snapshot) => (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  borderRadius: 2,
                  ...(snapshot.isDraggingOver && {
                    border: `3px dashed ${pickList.length >= length && !snapshot.draggingOverWith?.includes(id) ? '#fca5a5' : '#ccc'}`
                  })
                }}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <Stack spacing={2} alignItems="center" width="100%" px={1}>
                  {pickList.map((team, index) => (
                    <AwardListItem
                      key={id + ':' + team._id}
                      droppableId={id}
                      team={team}
                      index={index}
                      shouldPlayErrorAnimation={
                        snapshot.isDraggingOver &&
                        !!snapshot.draggingOverWith?.includes(team._id.toString()) &&
                        !snapshot.draggingFromThisWith?.includes(id)
                      }
                      disabled={disabled}
                    />
                  ))}
                  {pickList.length < length && suggestedTeam && addSuggestedTeam && !disabled && (
                    <SuggestedTeamItem team={suggestedTeam} addTeam={addSuggestedTeam} />
                  )}
                </Stack>
                <span style={{ display: 'none' }}>{provided.placeholder}</span>
              </Box>
            )}
          </Droppable>
        </Grid>
        <Grid size={3}>
          <Stack spacing={2}>
            {[...Array(length).keys()].map(index =>
              withIcons && index < trophyCount ? (
                <Box
                  key={index}
                  position="relative"
                  display="inline-flex"
                  justifyContent="center"
                  alignItems="center"
                  minHeight={35}
                >
                  {awardIcons[Math.min(index, 3)]}
                </Box>
              ) : (
                <Typography
                  key={index}
                  fontSize="1.25rem"
                  fontWeight={600}
                  color="#666"
                  minHeight={35}
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-end"
                  justifyContent="center"
                >
                  .{index + 1}
                </Typography>
              )
            )}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AwardList;
