import {
  createAsyncThunk,
  createSlice,
  createSelector,
} from '@reduxjs/toolkit';

import * as api from 'api/base';
import { OK } from 'api/constants';
import { endpoints } from 'api/endpoints';
import { getFilteredRecords } from 'pages/Chatbot/filter';

const name = 'people';

export const fetchPeople = createAsyncThunk(
  `${name}/fetchPeople`,
  async (
    { options, feFilters = null, isPolling = false },
    { rejectWithValue },
  ) => {
    const response = await api.get(endpoints.chatbot.people.getAll, options);

    if (response.status === OK) {
      return {
        isPolling,
        feFilters,
        data: response.data,
      };
    }

    return rejectWithValue({ error: true });
  },
);

export const initialState = {
  allPeople: [],
  pollingData: [],
  filteredPeople: null,
  sortByDate: 'desc',
  alertSource: 'all',
  error: false,
  peopleDetail: null,
};

const peopleSlice = createSlice({
  name,
  initialState,
  reducers: {
    refreshPeople: (state, { payload }) => {
      state.allPeople = payload;
      state.filteredPeople = null;
      state.error = false;
    },
    setFilteredPeople: (state, { payload }) => {
      state.filteredPeople = payload;
      state.error = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPeople.fulfilled, (state, { payload }) => {
        if (payload.isPolling) {
          state.pollingData = payload.data;
          state.error = false;
        } else {
          const { activity, status, sortOrder } = payload.feFilters;
          const filters = { activity, status };
          const sort = { fieldName: 'timestamp', order: sortOrder };
          const filteredPeople = getFilteredRecords(
            payload.data,
            filters,
            sort,
          );

          state.filteredPeople = filteredPeople;
          state.allPeople = payload.data;
          state.error = false;
        }
      })
      .addCase(fetchPeople.rejected, state => {
        state.error = true;
      });
  },
});

export const { refreshPeople, setFilteredPeople } = peopleSlice.actions;

const baseSelector = state => state?.people;

export const allPeopleSelector = createSelector(
  baseSelector,
  people => people?.allPeople,
);

export const filteredPeopleSelector = createSelector(
  baseSelector,
  people => people?.filteredPeople,
);

export const peoplePollingDataSelector = createSelector(
  baseSelector,
  people => people?.pollingData,
);

export const missionCreatedSelector = createSelector(
  baseSelector,
  people => people?.missionCreated,
);

export default peopleSlice.reducer;
