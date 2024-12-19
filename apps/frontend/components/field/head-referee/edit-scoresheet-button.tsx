import { Badge, Button, SxProps, Theme, Tooltip } from '@mui/material';
import NextLink from 'next/link';

const mapStatus: {
  [key: string]: {
    title: string;
    sx: SxProps<Theme>;
  };
} = {
  empty: {
    title: 'לא מולא',
    sx: {
      color: '#444',
      border: '1px solid #CACACA',
      '&:hover': {
        background: 'rgba(0, 0, 0, 0.04)'
      }
    }
  },
  'in-progress': {
    title: 'בתהליך',
    sx: {
      color: '#0c4a6e',
      border: '1px solid #0284c7',
      background: '#e0f2fe',
      '&:hover': {
        background: '#bae5ff'
      }
    }
  },
  completed: {
    title: 'ממתין להגשה סופית',
    sx: {
      color: '#fff',
      background: '#0284c7',
      '&:hover': {
        background: '#0369a1'
      }
    }
  },
  'waiting-for-gp': {
    title: 'ממתין לציון מקצועיות אדיבה',
    sx: {
      color: '#fff',
      background: '#4338ca',
      '&:hover': {
        background: '#3730a3'
      }
    }
  },
  'waiting-for-head-ref': {
    title: 'ממתין לשופט ראשי',
    sx: {
      color: '#fff',
      background: '#ff9800',
      '&:hover': {
        background: '#f79300'
      }
    }
  },
  'waiting-for-head-ref-gp': {
    title: 'ממתין לציון מקצועיות אדיבה משופט ראשי',
    sx: {
      color: '#fff',
      background: '#F26B0F',
      '&:hover': {
        background: '#f79300'
      }
    }
  },
  ready: {
    title: 'הוגש',
    sx: {
      color: '#fff',
      background: '#059669',
      '&:hover': {
        background: '#047857'
      }
    }
  }
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
  status: string;
  active: boolean;
  tooltip?: string;
  score?: number;
  gp?: number;
  children: React.ReactNode;
}

const EditScoresheetButton: React.FC<EditScoresheetButtonProps> = ({ ...props }) => {
  const { href, status, active, tooltip, score, gp, children } = props;
  const { title, sx } = mapStatus[status];
  return (
    <Wrapper href={href} {...props}>
      <Tooltip title={tooltip ? tooltip : title} arrow enterDelay={1000}>
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
            <Button size="small" sx={{ mx: 0.5, px: 1, ...sx }} disabled={!active}>
              {children}
            </Button>
          </Badge>
        </span>
      </Tooltip>
    </Wrapper>
  );
};

export default EditScoresheetButton;
