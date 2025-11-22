'use client';

import { Table, TableHead, TableBody, Paper } from '@mui/material';
import { JudgingCategory } from '@lems/types';
import { RubricsSchema } from '@lems/shared/rubrics';
import { TableHeaderRow } from './table-header-row';
import { SectionTitleRow } from './section-title-row';
import { FieldRatingRow } from './field-rating-row';
import { FeedbackRow } from './feedback-row';

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
          '& thead': {
            backgroundColor: 'action.hover'
          },
          '& td, & th': {
            borderColor: 'divider'
          }
        }}
        stickyHeader
      >
        {sections.length > 0 && (
          <TableHead>
            <TableHeaderRow category={category} />
          </TableHead>
        )}

        <TableBody>
          {sections.map(section => (
            <>
              <SectionTitleRow
                key={`section-header-${section.id}`}
                sectionId={section.id}
                category={category}
              />
              {section.fields.map(field => (
                <FieldRatingRow
                  key={field.id}
                  category={category}
                  fieldId={field.id}
                  sectionId={section.id}
                  coreValues={field.coreValues}
                  disabled={disabled}
                />
              ))}
            </>
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
