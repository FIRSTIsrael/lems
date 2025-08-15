import { ColorPicker, FormikTextField } from '@lems/shared';
import { Paper, Box, IconButton, Typography } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { HsvaColor, hsvaToHex } from '@uiw/react-color';
import { useTranslations } from 'next-intl';

interface DivisionItemProps {
  division: { name: string; color: HsvaColor };
  updateDivisionField: (index: number, field: 'name' | 'color', value: string | HsvaColor) => void;
  removeDivision: (index: number) => void;
  isRemovable?: boolean;
  index: number;
}

export const DivisionItem: React.FC<DivisionItemProps> = ({
  division,
  updateDivisionField,
  removeDivision,
  isRemovable = true,
  index
}) => {
  const t = useTranslations('pages.events.create.form.fields.division');

  return (
    <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50' }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <ColorPicker
          value={division.color}
          onChange={(hsvaColor: HsvaColor) => updateDivisionField(index, 'color', hsvaColor)}
        >
          <IconButton
            sx={{
              width: 32,
              height: 32,
              backgroundColor: hsvaToHex(division.color),
              '&:hover': {
                backgroundColor: hsvaToHex(division.color),
                opacity: 0.8,
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
            aria-label={`Choose color for division ${index + 1}`}
          />
        </ColorPicker>

        <Typography variant="h6" flexGrow={1}>
          {t('title', { number: index + 1 })}
        </Typography>

        {isRemovable && (
          <IconButton
            onClick={() => removeDivision(index)}
            color="error"
            size="small"
            aria-label={`Remove division ${index + 1}`}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Box>

      <FormikTextField
        name={`divisions.${index}.name`}
        label={t('name.label')}
        placeholder={t('name.placeholder')}
        value={division.name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          updateDivisionField(index, 'name', e.target.value)
        }
      />
    </Paper>
  );
};
