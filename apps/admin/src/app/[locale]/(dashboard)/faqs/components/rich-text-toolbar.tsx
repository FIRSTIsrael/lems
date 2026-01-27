import { IconButton, Tooltip, Box } from '@mui/material';
import { FormatBold, FormatItalic, FormatListBulleted } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface RichTextToolbarProps {
  onCommand: (command: string, value?: string) => void;
  disabled?: boolean;
}

export function RichTextToolbar({ onCommand, disabled = false }: RichTextToolbarProps) {
  const t = useTranslations('pages.faqs.editor.toolbar');

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={t('bold')}>
        <span>
          <IconButton
            size="small"
            onClick={() => onCommand('bold')}
            disabled={disabled}
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <FormatBold />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t('italic')}>
        <span>
          <IconButton
            size="small"
            onClick={() => onCommand('italic')}
            disabled={disabled}
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <FormatItalic />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t('bullets')}>
        <span>
          <IconButton
            size="small"
            onClick={() => onCommand('insertUnorderedList')}
            disabled={disabled}
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <FormatListBulleted />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
