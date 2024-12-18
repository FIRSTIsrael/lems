import { ResponsiveStyleValue } from '@mui/system';
import { JudgingCategory, Rubric } from '@lems/types';
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

interface RubricAwardsProps {
  size: ResponsiveStyleValue<GridSize>;
  rubric: Rubric<JudgingCategory>;
  schema: RubricsSchema;
}

export const RubricAwards: React.FC<RubricAwardsProps> = ({ size, rubric, schema }) => {
  if (!schema.awards) return <></>;

  return (
    <Grid size={size}>
      <Typography variant="body2" gutterBottom textAlign="left" ml={6}>
        אם הקבוצה הצטיינה באחד התחומים הבאים, נא לסמן את המשבצת המתאימה:
      </Typography>
      {schema.awards.map(award => (
        <ListItem key={award.id} disablePadding>
          <ListItemButton
            dense
            sx={{ borderRadius: 2, px: 2 }}
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
