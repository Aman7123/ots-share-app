import { useState, useEffect } from 'react';

import copy from 'copy-to-clipboard';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Paper from '@mui/material/Paper';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import RefreshRounded from '@mui/icons-material/RefreshRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { dtos, models } from '@ots-share/model';

import { encrypt, createRandomPassword } from './lib/encryption';
import { buildUrlToShare } from './lib/url';
import { post } from './lib/api';

import LoadScreen from './LoadScreen';
import ErrorDialog from './ErrorDialog';

const title = 'Create One-time secret share';

export default function Create() {
  const [password, setPassword] = useState(createRandomPassword());
  const [openDialogBox, setOpenDialogBox] = useState(false);
  const [isSuccessRequest, setIsSuccessRequest] = useState(true);
  const [contentForModal, setContentForModal] = useState('');
  const [showLoadModal, setShowLoadModal] = useState(false);

  useEffect(() => {
    document.title = title;
  }, []);

  const handleClickOpen = () => {
    setOpenDialogBox(true);
  };

  const handleClose = () => {
    if (isSuccessRequest) {
      window.location.reload();
    }

    setOpenDialogBox(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowLoadModal(true);

    const data = new FormData(event.currentTarget);

    const content = data.get('content') as string;
    const password = data.get('password') as string;
    const expiresInValue = parseInt(data.get('expiresInValue') as string, 10);
    const expiresInUnit = data.get('expiresInUnit') as dtos.RecordExpirationUnitEnum;
    const cipherText = encrypt(content, password);

    post('record', {
      content: cipherText,
      expireIn: {
        value: expiresInValue,
        unit: expiresInUnit,
      },
    }).then((data: { message?: string } & models.IRecord) => {
      setShowLoadModal(false);

      if (data.message) {
        setIsSuccessRequest(false);
        setContentForModal(data.message);
      } else {
        setIsSuccessRequest(true);
        setContentForModal(buildUrlToShare(window.location.origin, data, password));
      }

      handleClickOpen();
    })
    .catch((error: Error) => {
      setIsSuccessRequest(false);
      setContentForModal(error.message);
    });
  };

  return (
    <Container>
      <LoadScreen open={showLoadModal} />

      <Box
        sx={{
          marginTop: 8,
          flexDirection: 'column',
          alignItems: 'left',
        }}
      >
        <Box component="form" sx={{ mt: 3 }} onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ m: 1 }}>
                <LockOutlinedIcon sx={{ color: 'primary.main' }} />
                <Typography component="h1" variant="h5">
                  {title}
                </Typography>
              </Stack>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoFocus
                required
                fullWidth
                multiline
                name="content"
                label="Secret content"
                id="content"
                InputProps={{
                  rows: 3,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                id="password"
                variant="filled"
                value={password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        edge="start"
                        color="primary"
                        onClick={() => setPassword(createRandomPassword())}
                      >
                        <RefreshRounded />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        color="primary"
                        onClick={() => copy(password)}
                      >
                        <Tooltip id="copyContent" title="Copy password">
                          <ContentCopyIcon />
                        </Tooltip>
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              ></TextField>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={6}>
              <TextField
                required
                fullWidth
                type="number"
                defaultValue="1"
                name="expiresInValue"
                label="Expires In"
                id="expiresInValue"
              />
            </Grid>
            <Grid item xs={6}>
              <Select
                id="expiresInUnit"
                defaultValue={dtos.RecordExpirationUnitEnum.hours}
                name="expiresInUnit"
              >
                {
                  // @ts-ignore
                  <MenuItem value={dtos.RecordExpirationUnitEnum.minutes}>
                    {dtos.RecordExpirationUnitEnum.minutes}
                  </MenuItem>
                }
                {
                  // @ts-ignore
                  <MenuItem value={dtos.RecordExpirationUnitEnum.hours}>
                    {dtos.RecordExpirationUnitEnum.hours}
                  </MenuItem>
                }
              </Select>
            </Grid>
            <Grid item xs={12}>
              <Divider />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                Create
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <DialogBox success={isSuccessRequest} open={openDialogBox} handleClose={handleClose} content={contentForModal} />
    </Container>
  );
}

function DialogBox({
  success,
  open,
  handleClose,
  content,
}: {
  success: boolean;
  open: boolean;
  content: string;
  handleClose: () => void;
}) {
  if (success) {
    return successDialogBox({ open, handleClose, content });
  }

  return ErrorDialog({ open, handleClose, content, showOkButton: true });
}

function successDialogBox({
  open,
  handleClose,
  content,
}: {
  open: boolean;
  content: string;
  handleClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
      fullWidth={true}
      maxWidth={'lg'}
      disableEscapeKeyDown
    >
      <DialogTitle>{'Your Url'}</DialogTitle>
      <DialogContent>
        <Paper elevation={5}>
          <TextField
            autoFocus
            required
            fullWidth={true}
            name="createdUrl"
            label="send this url to the other party"
            id="createdUrl"
            variant="filled"
            value={content}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip id="copyUrl" title="Copy Url">
                    <IconButton
                      edge="end"
                      color="primary"
                      onClick={() => copy(content)}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          ></TextField>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}
