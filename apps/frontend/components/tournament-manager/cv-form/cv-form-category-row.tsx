import Image from 'next/image';
import { Typography, TableCell, TableRow, Stack } from '@mui/material';
import { CVFormSchemaCategory } from '@lems/season';
import FormikCheckbox from '../../general/forms/formik-checkbox';
import FormikConditionalTextField from '../../general/forms/formik-conditional-text-field';

interface CVFormCategoryRowProps {
  category: CVFormSchemaCategory;
}

const CVFormCategoryRow: React.FC<CVFormCategoryRowProps> = ({ category }) => {
  return (
    <TableRow>
      <TableCell align="center">
        <Image
          width={64}
          height={64}
          src={`https://emojicdn.elk.sh/${category.emoji}`}
          alt="אימוג׳י המתאר את חומרת הקטגוריה"
        />
        <Typography fontSize="1rem" fontWeight={500}>
          {category.title}
        </Typography>
        <Typography fontSize="1rem" fontWeight={500}>
          {category.description}
        </Typography>
      </TableCell>
      {['teamOrStudent', 'anyoneElse'].map(columnName => (
        <TableCell key={columnName}>
          <Stack spacing={2}>
            {category[columnName as 'teamOrStudent' | 'anyoneElse'].map((clause, index) => (
              <FormikCheckbox
                key={index}
                name={`data.${category.id}.${columnName}.fields.${index}`}
                label={clause}
              />
            ))}
            <FormikConditionalTextField
              name={`data.${category.id}.${columnName}.other`}
              label="אחר (נא לפרט)"
            />
          </Stack>
        </TableCell>
      ))}
    </TableRow>
  );
};

export default CVFormCategoryRow;
