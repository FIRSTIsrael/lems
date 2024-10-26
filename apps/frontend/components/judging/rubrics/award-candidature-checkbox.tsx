import React from 'react';
import Markdown from 'react-markdown';
import { FastField, FieldProps } from 'formik';
import {
  Checkbox,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';

interface AwardCandidatureCheckboxProps {
  name: string;
  title: string;
  description: string;
  disabled?: boolean;
}

const AwardCandidatureCheckbox: React.FC<AwardCandidatureCheckboxProps> = ({
  name,
  title,
  description,
  disabled
}) => {
  return (
    <FastField name={`${name}`}>
      {({ field: { onBlur, checked, ...field }, form }: FieldProps) => (
        <ListItem disablePadding>
          <ListItemButton
            role={undefined}
            dense
            sx={{ borderRadius: 2, px: 2 }}
            onClick={e => {
              form.setFieldValue(field.name, !field.value);
              setTimeout(() => onBlur(e), 10);
            }}
            disabled={disabled && !form.isSubmitting}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Checkbox
                edge="start"
                tabIndex={-1}
                disableRipple
                inputProps={{ 'aria-labelledby': `${name}-label` }}
                onBlur={e => onBlur(e ?? field.name)}
                checked={field.value}
                {...field}
                onChange={undefined}
              />
            </ListItemIcon>
            <ListItemText
              id={`${name}-label`}
              primary={
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {title}
                </Typography>
              }
              secondary={
                <Typography component="span">
                  <Markdown skipHtml>{description}</Markdown>
                </Typography>
              }
            />
          </ListItemButton>
        </ListItem>
      )}
    </FastField>
  );
};

export default React.memo(AwardCandidatureCheckbox);
