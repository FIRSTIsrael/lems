'use client';

import React from 'react';
import { Table, TableHead, TableBody, Paper } from '@mui/material';
import { JudgingCategory } from '@lems/types/judging';
import { RubricsSchema } from '@lems/shared/rubrics';
import { useRubric } from '../rubric-context';
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
  const { fieldValues } = useRubric();

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 2,
        my: 2
      }}
    >
      <Table
        sx={{
          tableLayout: 'fixed',
          '& thead': {
            backgroundColor: 'action.hover'
          },
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
                  {fieldValues.get(field.id)?.value === 4 && (
                    <FieldNotesRow fieldId={field.id} disabled={disabled} />
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
          <FeedbackRow category={category} disabled={disabled} />
        </TableBody>
      </Table>
    </Paper>
  );
};
