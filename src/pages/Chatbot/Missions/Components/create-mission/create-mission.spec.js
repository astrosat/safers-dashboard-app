import React from 'react';

import { OK } from 'api/constants';
import { server, rest } from 'mocks/server';
import { screen, render, waitFor } from 'test-utils';

import CreateMission from './CreateMission';

const state = {
  common: {
    orgList: [],
    teamList: [],
  },
  user: {
    info: {},
  },
};

describe('CreateMission', () => {
  it('renders', async () => {
    server.use(
      rest.get('*/teams', async (req, res, ctx) => {
        return res(ctx.status(OK), ctx.json([]));
      }),
    );
    render(<CreateMission t={str => str} />, { state });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });
  });
});
