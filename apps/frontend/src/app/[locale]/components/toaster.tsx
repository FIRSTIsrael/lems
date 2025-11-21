import { Toaster } from 'react-hot-toast';

interface LemsToasterProps {
  dir: 'ltr' | 'rtl';
}

export const LemsToaster: React.FC<LemsToasterProps> = ({ dir }) => {
  const position = dir === 'ltr' ? 'bottom-right' : 'bottom-left';

  return (
    <Toaster
      position={position}
      reverseOrder={false}
      gutter={16}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '8px',
          boxShadow: '0 6px 12px 0 rgb(0 0 0 / 8%), 0 0 0 1px rgb(0 0 0 / 6%)',
          fontSize: '0.95rem'
        },
        success: {
          style: {
            background: '#e8f5e9',
            color: '#1b5e20',
            border: '1px solid #81c784'
          }
        },
        error: {
          style: {
            background: '#ffebee',
            color: '#b71c1c',
            border: '1px solid #ef5350'
          }
        }
      }}
    />
  );
};
