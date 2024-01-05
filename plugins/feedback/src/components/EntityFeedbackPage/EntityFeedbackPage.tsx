import React, { useEffect, useState } from 'react';

import { Progress } from '@backstage/core-components';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import {
  ButtonGroup,
  CircularProgress,
  createStyles,
  Dialog,
  makeStyles,
  Snackbar,
  Theme,
  Tooltip,
  Zoom,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Add from '@material-ui/icons/Add';
import ArrowForwardRounded from '@material-ui/icons/ArrowForwardRounded';
import Sync from '@material-ui/icons/Sync';
import { Alert } from '@material-ui/lab';

import { CreateFeedbackModal } from '../CreateFeedbackModal/CreateFeedbackModal';
import { FeedbackDetailsModal } from '../FeedbackDetailsModal';
import { FeedbackTable } from '../FeedbackTable';
import { CustomEmptyState } from './CustomEmptyState';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    buttonGroup: {
      textAlign: 'center',
      whiteSpace: 'nowrap',
      marginTop: theme.spacing(1),
    },
  }),
);

export const EntityFeedbackPage = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const user = useApi(identityApiRef);

  const [modalProps, setModalProps] = useState<{
    projectEntity: string;
    userEntity: string;
    serverType: string;
  }>();

  const [modalOpen, setModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState<{
    message: string;
    open: boolean;
    severity: 'success' | 'error';
  }>({
    message: '',
    open: false,
    severity: 'success',
  });
  const [reload, setReload] = useState(false);
  useEffect(() => {
    setReload(false);
  }, [snackbarOpen, reload]);

  const projectEntity =
    `${entity.kind}:${entity.metadata.namespace}/${entity.metadata.name}`.toLowerCase();

  const pluginConfig = {
    'feedback/type': entity.metadata.annotations!['feedback/type'],
    'feedback/host': entity.metadata.annotations!['feedback/host'],
    'feedback/mail-to': entity.metadata.annotations!['feedback/email-to'],
    'jira/project-key': entity.metadata.annotations!['jira/project-key'],
  };

  async function handleModalOpen() {
    const userEntity = (await user.getBackstageIdentity()).userEntityRef;
    setModalProps({
      projectEntity: projectEntity,
      userEntity: userEntity,
      serverType: pluginConfig['feedback/type'],
    });

    return setModalOpen(true);
  }

  const handleModalClose = (respObj?: any) => {
    setModalOpen(false);
    if (respObj) {
      setReload(true);
      if (respObj.error) {
        setSnackbarOpen({
          message: respObj.error,
          severity: 'error',
          open: true,
        });
      } else if (respObj.message) {
        setSnackbarOpen({
          message: respObj.message,
          severity: 'success',
          open: true,
        });
      }
    }
  };

  const handleSnackbarClose = (
    event?: React.SyntheticEvent,
    reason?: string,
  ) => {
    event?.preventDefault();
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen({ ...snackbarOpen, open: false });
  };

  const handleResyncClick = () => {
    setReload(true);
  };

  return pluginConfig['feedback/mail-to'] === undefined ? (
    <CustomEmptyState {...pluginConfig} />
  ) : (
    <Grid container justifyContent="flex-end">
      <FeedbackDetailsModal />
      <Grid item>
        <ButtonGroup
          className={classes.buttonGroup}
          color="primary"
          variant="outlined"
        >
          <Tooltip
            title="Give a feedback / Report a issue"
            arrow
            TransitionComponent={Zoom}
          >
            <Button startIcon={<Add />} onClick={handleModalOpen}>
              Create
            </Button>
          </Tooltip>
          {pluginConfig['feedback/type'] === 'JIRA' && (
            <Tooltip
              title="Go to Jira Project"
              arrow
              TransitionComponent={Zoom}
            >
              <Button
                endIcon={<ArrowForwardRounded />}
                href={`${pluginConfig['feedback/host']}/projects/${pluginConfig['jira/project-key']}/summary`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to Jira Project
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Refresh" arrow TransitionComponent={Zoom}>
            <Button onClick={handleResyncClick}>
              {!reload ? <Sync /> : <CircularProgress size="1.5rem" />}
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Grid>
      <Dialog
        open={modalOpen}
        onClose={() => handleModalClose('')}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        fullWidth
        maxWidth="md"
      >
        <CreateFeedbackModal
          {...modalProps!}
          handleModalCloseFn={handleModalClose}
        />
      </Dialog>
      <Grid item xs={12}>
        {reload ? <Progress /> : <FeedbackTable projectId={projectEntity} />}
      </Grid>
      <Snackbar
        open={snackbarOpen?.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert severity={snackbarOpen.severity} onClose={handleSnackbarClose}>
          {snackbarOpen?.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};
