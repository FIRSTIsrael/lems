'use client';

import React from 'react';
import { Table, TableHead, TableBody, Paper } from '@mui/material';
import { useFormikContext } from 'formik';
import { JudgingCategory } from '@lems/types';
import { RubricsSchema } from '@lems/shared/rubrics';
import { RubricFormValues } from '../../rubric-types';
import { TableHeaderRow } from './table-header-row';
import { SectionTitleRow } from './section-title-row';
import { FieldRatingRow } from './field-rating-row';
import { FieldNotesRow } from './field-notes-row';
import { FeedbackRow } from './feedback-row';
import { RubricCategoryNavigation } from './rubric-category-navigation';

interface RubricTableProps {
  sections: RubricsSchema[JudgingCategory]['sections'];
  category: JudgingCategory;
  disabled?: boolean;
}

export const RubricTable: React.FC<RubricTableProps> = ({
  sections,
  category,
  disabled = false
}) => {
  const { values } = useFormikContext<RubricFormValues>();

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 2,
        backgroundColor: '#fff',
        my: 2
      }}
    >
      <Table
        sx={{
          tableLayout: 'fixed',
          '& td, & th': {
            borderColor: 'divider'
          }
        }}
        stickyHeader
      >
        <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
          <RubricCategoryNavigation />
          {sections.length > 0 && <TableHeaderRow category={category} />}
        </TableHead>

        <TableBody>
          {sections.map(section => (
            <React.Fragment key={section.id}>
              <SectionTitleRow
                key={`section-header-${section.id}`}
                sectionId={section.id}
                category={category}
              />
              {section.fields.map(field => (
                <React.Fragment key={field.id}>
                  <FieldRatingRow
                    category={category}
                    fieldId={field.id}
                    sectionId={section.id}
                    coreValues={field.coreValues}
                    disabled={disabled}
                  />
                  {values.fields[field.id]?.value === 4 && (
                    <FieldNotesRow fieldId={field.id} disabled={disabled} />
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
          <FeedbackRow
            category={category}
            disabled={disabled}
            rounded={category === 'core-values'}
          />
        </TableBody>
      </Table>
    </Paper>
  );
};
