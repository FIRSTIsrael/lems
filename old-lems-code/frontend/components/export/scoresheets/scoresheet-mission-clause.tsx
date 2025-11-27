import { WithId } from 'mongodb';
import Markdown from 'react-markdown';
import { Typography, ThemeProvider } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Scoresheet } from '@lems/types';
import { LocalizedMission, MissionClauseSchema } from '@lems/season';

interface ScoresheetMissionClauseProps {
  scoresheet: WithId<Scoresheet>;
  missionIndex: number;
  clauseIndex: number;
  clause: MissionClauseSchema;
  localizedMission: LocalizedMission;
}

export const ScoresheetMissionClause: React.FC<ScoresheetMissionClauseProps> = ({
  scoresheet,
  missionIndex,
  clauseIndex,
  clause,
  localizedMission
}) => {
  let valueString: string | null = null;

  try {
    const value = scoresheet.data?.missions[missionIndex]?.clauses[clauseIndex]?.value;
    if (clause.type === 'boolean') {
      valueString = value ? 'כן' : 'לא';
    } else if (clause.type === 'number') {
      valueString = String(value ?? 0);
    } else if (clause.type === 'enum' && clause.options) {
      if (clause.multiSelect) {
        valueString = (value as unknown as Array<string>)
          .map(v => {
            const optionIndex = (clause.options ?? []).indexOf(v);
            const label = localizedMission.clauses[clauseIndex].labels?.[optionIndex];
            return label;
          })
          .join(', ');
      } else {
        const optionIndex = clause.options.indexOf(value as string);
        const label = localizedMission.clauses[clauseIndex].labels?.[optionIndex];
        valueString = label ?? '';
      }
    }
  } catch {
    valueString = null;
  }

  return (
    <ThemeProvider
      theme={outerTheme => ({
        ...outerTheme,
        components: {
          MuiToggleButton: {
            styleOverrides: {
              root: {
                '&.Mui-selected': {
                  '&:hover': {
                    color: '#FFF',
                    backgroundColor: '#81c784'
                  },
                  color: '#FFF',
                  backgroundColor: '#2e7d32'
                }
              }
            }
          }
        }
      })}
    >
      <Grid alignItems="center" size={12} pb={0.35} pl={1}>
        <Markdown skipHtml components={{ p: 'span' }}>
          {localizedMission.clauses[clauseIndex].description}
        </Markdown>
        &nbsp;
        <Typography
          component="span"
          sx={{
            fontSize: '0.9rem',
            color: '#d32f2f',
            fontWeight: 'bold',
            display: 'inline'
          }}
        >
          {valueString}
        </Typography>
      </Grid>
    </ThemeProvider>
  );
};
