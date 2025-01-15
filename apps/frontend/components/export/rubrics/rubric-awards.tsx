import { ResponsiveStyleValue } from '@mui/system';
import { Award, JudgingCategory, Rubric } from '@lems/types';
import Grid, { GridSize } from '@mui/material/Grid2';
import {
  Checkbox,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';
import { RubricsSchema } from '@lems/season';
import UncheckedIcon from '@mui/icons-material/CircleOutlined';
import CheckedIcon from '@mui/icons-material/TaskAltRounded';
import Markdown from 'react-markdown';
import { WithId } from 'mongodb';

interface RubricAwardsProps {
  size: ResponsiveStyleValue<GridSize>;
  rubric: Rubric<JudgingCategory>;
  divisionAwards: Array<WithId<Award>>;
  schema: RubricsSchema;
}

export const RubricAwards: React.FC<RubricAwardsProps> = ({
  size,
  rubric,
  divisionAwards,
  schema
}) => {
  const awards = schema.awards?.filter(schemaAward =>
    divisionAwards?.find(award => award.name === schemaAward.id)
  );
  if (!awards) return null;

  return (
    <Grid size={size}>
      <Typography variant="body2" gutterBottom textAlign="left" ml={6}>
        אם הקבוצה הצטיינה באחד התחומים הבאים, נא לסמן את המשבצת המתאימה:
      </Typography>
      {awards.map((award, index) => (
        <ListItem key={`award-${award.id}`} disablePadding>
          <ListItemButton
            dense
            sx={{
              borderRadius: 2,
              px: 2,
              '@media print': {
                borderRadius: 0,
                borderBottom: index < awards.length - 1 ? '0.5px solid rgba(0,0,0,0.2)' : 'none',
                paddingBottom: 1,
                paddingTop: 1
              }
            }}
            disabled={!rubric.data?.awards?.[award.id]}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Checkbox
                edge="start"
                tabIndex={-1}
                disableRipple
                icon={
                  <UncheckedIcon
                    sx={{
                      fontSize: '1.5em',
                      color: 'rgba(0,0,0,0.24)'
                    }}
                  />
                }
                checkedIcon={<CheckedIcon sx={{ fontSize: '1.5em', color: '#0071e3' }} />}
                checked={rubric.data?.awards?.[award.id]}
              />
            </ListItemIcon>
            <ListItemText>
              <b>{award.title} - </b>{' '}
              <Markdown skipHtml components={{ p: 'span' }}>
                {award.description}
              </Markdown>
            </ListItemText>
          </ListItemButton>
        </ListItem>
      ))}
    </Grid>
  );
};
