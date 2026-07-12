import { IconButton, Tooltip, Box, Typography } from '@mui/material';
import { Palette } from '@mui/icons-material';
import { ColorPicker } from '@lems/shared';
import { HsvaColor, hsvaToHex } from '@uiw/react-color';
interface ColorPaletteProps {
  textColor: HsvaColor;
  usedColors: string[];
  onColorChange: (color: string) => void;
  onSaveSelection: () => void;
  disabled?: boolean;
}

export function ColorPalette({
  textColor,
  usedColors,
  onColorChange,
  onSaveSelection,
  disabled = false
}: ColorPaletteProps) {
  const currentColor = hsvaToHex(textColor);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <ColorPicker value={textColor} onChange={color => onColorChange(hsvaToHex(color))}>
        <IconButton
          size="small"
          onMouseDown={onSaveSelection}
          onClick={() => onColorChange(currentColor)}
          disabled={disabled}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          <Palette sx={{ color: currentColor }} />
        </IconButton>
      </ColorPicker>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {usedColors
          .filter(color => color.toLowerCase() !== currentColor.toLowerCase())
          .map(color => (
            <Tooltip key={color} title={color}>
              <Box
                onClick={() => onColorChange(color)}
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  bgcolor: color,
                  cursor: disabled ? 'default' : 'pointer',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              />
            </Tooltip>
          ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: currentColor,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: theme => `0 0 0 2px ${theme.palette.primary.main}`
          }}
        />
        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
          {currentColor}
        </Typography>
      </Box>
    </Box>
  );
}
