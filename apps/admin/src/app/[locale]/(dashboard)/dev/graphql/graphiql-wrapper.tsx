'use client';

import { useState, useMemo } from 'react';
import { GraphiQL } from 'graphiql';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { ToolbarButton } from '@graphiql/react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import 'graphiql/setup-workers/webpack';
import 'graphiql/style.css';

const getApiBase = () => {
  if (typeof window === 'undefined') return '';
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';
};

export default function GraphiQLWrapper() {
  const [authToken, setAuthToken] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('graphiql-auth-token') || '';
    }
    return '';
  });
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState('');

  const fetcher = useMemo(() => {
    const apiBase = getApiBase();
    const graphqlUrl = `${apiBase}/lems/graphql`;

    const customFetch: typeof fetch = (url, options) => {
      return fetch(url, {
        ...options,
        credentials: 'include'
      });
    };

    return createGraphiQLFetcher({
      url: graphqlUrl,
      fetch: customFetch,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    });
  }, [authToken]);

  const handleTokenDialogOpen = () => {
    setTokenInput(authToken);
    setTokenDialogOpen(true);
  };

  const handleTokenDialogClose = () => {
    setTokenDialogOpen(false);
  };

  const handleTokenSave = () => {
    setAuthToken(tokenInput);
    if (tokenInput) {
      localStorage.setItem('graphiql-auth-token', tokenInput);
    } else {
      localStorage.removeItem('graphiql-auth-token');
    }
    setTokenDialogOpen(false);
  };

  const handleTokenClear = () => {
    setTokenInput('');
    setAuthToken('');
    localStorage.removeItem('graphiql-auth-token');
    setTokenDialogOpen(false);
  };

  return (
    <>
      <GraphiQL fetcher={fetcher} defaultEditorToolsVisibility={true}>
        <GraphiQL.Toolbar>
          {({ prettify, copy, merge }) => (
            <>
              {prettify}
              {merge}
              {copy}
              <ToolbarButton
                onClick={handleTokenDialogOpen}
                label={
                  authToken ? 'Manage authentication token (active)' : 'Set authentication token'
                }
              >
                <KeyIcon
                  className="graphiql-toolbar-icon"
                  aria-hidden="true"
                  style={{ color: authToken ? '#10a37f' : undefined }}
                />
              </ToolbarButton>
            </>
          )}
        </GraphiQL.Toolbar>
      </GraphiQL>

      <Dialog open={tokenDialogOpen} onClose={handleTokenDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Authentication Token</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Bearer Token"
            type="password"
            fullWidth
            variant="outlined"
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            placeholder="Enter your JWT token"
            helperText="This token will be sent as Authorization: Bearer <token> with each request"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTokenClear} color="error">
            Clear
          </Button>
          <Button onClick={handleTokenDialogClose}>Cancel</Button>
          <Button onClick={handleTokenSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
