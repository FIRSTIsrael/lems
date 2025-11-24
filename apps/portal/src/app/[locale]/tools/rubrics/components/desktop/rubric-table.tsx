'use client';

import React from 'react';
import { Table, TableHead, TableBody, Paper } from '@mui/material';
import { rubrics } from '@lems/shared/rubrics';
import { useRubricContext } from '../rubric-context';
import { TableHeaderRow } from './table-header-row';
import { SectionTitleRow } from './section-title-row';
import { FieldRatingRow } from './field-rating-row';
import { FieldNotesRow } from './field-notes-row';
import { FeedbackRow } from './feedback-row';
import { RubricCategoryNavigation } from './rubric-category-navigation';

export const RubricTable: React.FC = () => {
  const { category, rubric, loading } = useRubricContext();
  const schema = rubrics[category];

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
          {schema.sections.length > 0 && <TableHeaderRow category={category} />}
        </TableHead>

        <TableBody>
          {schema.sections.map(section => (
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
                    disabled={loading}
                  />
                  {rubric.values.fields[field.id]?.value === 4 && (
                    <FieldNotesRow fieldId={field.id} disabled={loading} />
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
          <FeedbackRow category={category} disabled={loading} />
        </TableBody>
      </Table>
    </Paper>
  );
};
