import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FastField, FieldProps } from 'formik';
import {
  Checkbox,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';

interface Props {
  name: string;
  title: string;
  description: string;
  disabled?: boolean;
}

const AwardCandidatureCheckbox: React.FC<Props> = ({ name, title, description, disabled }) => {
  return (
    <FastField name={`${name}`}>
      {({ field: { onBlur, checked, ...field }, form }: FieldProps) => (
        <ListItem disablePadding sx={{ maxWidth: '28rem' }}>
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
                <ReactMarkdown skipHtml components={{ p: React.Fragment }}>
                  {description}
                </ReactMarkdown>
              }
            />
          </ListItemButton>
        </ListItem>
      )}
    </FastField>
  );
};

export default React.memo(AwardCandidatureCheckbox);
