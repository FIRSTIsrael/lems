import { ScoresheetStatus } from '@lems/types';
import { Badge, Button, Tooltip } from '@mui/material';
import NextLink from 'next/link';

const getTitleAndStyles = (status: ScoresheetStatus, escalated?: boolean) => {
  if (escalated) {
    return {
      title: 'ממתין לשופט ראשי',
      sx: {
        color: '#fff',
        background: '#ff9800',
        '&:hover': {
          background: '#f79300'
        }
      }
    };
  }

  switch (status) {
    case 'empty': {
      return {
        title: 'לא מולא',
        sx: {
          color: '#444',
          border: '1px solid #CACACA',
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.04)'
          }
        }
      };
    }
    case 'in-progress': {
      return {
        title: 'בתהליך',
        sx: {
          color: '#0c4a6e',
          border: '1px solid #0284c7',
          background: '#e0f2fe',
          '&:hover': {
            background: '#bae5ff'
          }
        }
      };
    }
    case 'completed': {
      return {
        title: 'ממתין להגשה סופית',
        sx: {
          color: '#fff',
          background: '#0284c7',
          '&:hover': {
            background: '#0369a1'
          }
        }
      };
    }
    case 'waiting-for-gp': {
      return {
        title: 'ממתין לציון מקצועיות אדיבה',
        sx: {
          color: '#fff',
          background: '#4338ca',
          '&:hover': {
            background: '#3730a3'
          }
        }
      };
    }
    case 'ready': {
      return {
        title: 'הוגש',
        sx: {
          color: '#fff',
          background: '#059669',
          '&:hover': {
            background: '#047857'
          }
        }
      };
    }
  }

  return {};
};

interface WrapperProps {
  href?: string;
  active: boolean;
  children: React.ReactNode;
}

const Wrapper: React.FC<WrapperProps> = ({ active, href, children }) => {
  if (active && href) {
    return (
      <NextLink href={href} passHref legacyBehavior>
        {children}
      </NextLink>
    );
  } else {
    return children;
  }
};

interface EditScoresheetButtonProps {
  href?: string;
  status: ScoresheetStatus;
  escalated?: boolean;
  active: boolean;
  tooltip?: string;
  score?: number;
  gp?: number;
  children: React.ReactNode;
}

const EditScoresheetButton: React.FC<EditScoresheetButtonProps> = ({
  href,
  status,
  escalated,
  active,
  tooltip,
  score,
  gp,
  children
}) => {
  const settings = getTitleAndStyles(status, escalated);

  return (
    <Wrapper href={href} active={active}>
      <Tooltip title={tooltip ? tooltip : settings.title} arrow enterDelay={1000}>
        <span>
          <Badge
            color={gp === 4 ? 'primary' : gp === 2 ? 'error' : undefined}
            sx={{
              '& .MuiBadge-badge': { backgroundColor: gp !== 4 && gp !== 2 ? '#ccc' : '' },
              height: '100%'
            }}
            badgeContent={score}
            max={1000}
          >
            <Button size="small" sx={{ mx: 0.5, px: 1, ...settings.sx }} disabled={!active}>
              {children}
            </Button>
          </Badge>
        </span>
      </Tooltip>
    </Wrapper>
  );
};

export default EditScoresheetButton;
