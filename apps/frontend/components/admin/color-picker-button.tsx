import { CSSProperties, useState } from 'react';
import { Button, ButtonProps } from '@mui/material';
import { TwitterPicker } from 'react-color';

interface ColorPickerButtonProps extends ButtonProps {
  swatches: Array<string>;
  value: CSSProperties['color'];
  setColor: (newColor: string) => void;
}

const ColorPickerButton: React.FC<ColorPickerButtonProps> = ({
  swatches,
  value,
  setColor,
  ...props
}) => {
  const [showPicker, setShowPicker] = useState<boolean>(false);

  return (
    <>
      <Button
        {...props}
        sx={{
          backgroundColor: value,
          borderRadius: '1rem',
          height: '100%',
          '&:hover': {
            backgroundColor: value + '7a'
          }
        }}
        onClick={() => setShowPicker(true)}
      />
      {showPicker && (
        <>
          <div style={{ position: 'absolute', zIndex: 5 }}>
            <div
              style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
              onClick={() => setShowPicker(false)}
            />
            <div style={{ marginTop: 10 }} />
            <TwitterPicker
              color={value}
              onChangeComplete={(newColor, e) => {
                if (e.type === 'click' || e.target.value.length === 6) {
                  setColor(newColor.hex);
                  setShowPicker(false);
                }
              }}
              colors={swatches}
              triangle="top-right"
            />
          </div>
        </>
      )}
    </>
  );
};

export default ColorPickerButton;
