import {
  createAsyncThunk,
  createSlice,
  createSelector,
} from '@reduxjs/toolkit';

import * as api from 'api/base';
import { OK } from 'api/constants';
import { endpoints } from 'api/endpoints';
import { getFilteredRecords } from 'pages/Chatbot/filter';

const name = 'reports';

export const fetchReports = createAsyncThunk(
  `${name}/fetchReports`,
  async ({ options, isPolling = false }, { rejectWithValue }) => {
    const response = await api.get(
      endpoints.chatbot.reports.getReports,
      options,
    );

    if (response.status === OK) {
      return {
        isPolling,
        data: response.data,
      };
    }

    return rejectWithValue({ error: true });
  },
);

export const fetchReportDetail = createAsyncThunk(
  `${name}/fetchReportDetail`,
  async (id, { rejectWithValue }) => {
    const response = await api.get(
      endpoints.chatbot.reports.getReportInfo.replace(':report_id', id),
    );

    if (response.status === OK) {
      return {
        data: response.data,
      };
    }

    return rejectWithValue({ error: true });
  },
);

export const initialState = {
  allReports: [],
  pollingData: [],
  alertSource: 'all',
  error: false,
  filteredReports: null,
  reportDetail: null,
  category: '',
  sortOrder: 'desc',
  missionId: '',
  boundingBox: null,
  mapFilter: { midPoint: [], currentZoomLevel: null },
};

const reportsSlice = createSlice({
  name,
  initialState,
  reducers: {
    refreshReports: (state, { payload }) => {
      state.allReports = payload;
      state.error = false;
    },
    setFilteredReports: (state, { payload }) => {
      const { missionId, category, sortOrder, boundingBox, mapFilter } =
        payload.filterParams;
      state.filteredReports = payload.data;
      state.missionId = missionId;
      state.category = category;
      state.sortOrder = sortOrder;
      state.boundingBox = boundingBox;
      state.mapFilter = mapFilter;
      state.error = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchReports.fulfilled, (state, { payload }) => {
        if (payload.isPolling) {
          state.pollingData = payload.data;
          state.error = false;
        } else {
          const { sortOrder, category } = state;
          const filteredReports = getFilteredRecords(
            payload.data,
            { category },
            { sortOrder },
          );

          state.filteredReports = filteredReports;
          state.allReports = payload.data;
          state.error = false;
        }
      })
      .addCase(fetchReports.rejected, state => {
        state.error = true;
      })
      .addCase(fetchReportDetail.fulfilled, (state, { payload }) => {
        state.reportDetail = payload.data;
        state.error = false;
      })
      .addCase(fetchReportDetail.rejected, state => {
        state.error = true;
      });
  },
});

export const { refreshReports, setFilteredReports } = reportsSlice.actions;

const baseSelector = state => state?.reports;

export const allReportsSelector = createSelector(
  baseSelector,
  reports => reports?.allReports,
);

export const filteredReportsSelector = createSelector(
  baseSelector,
  reports => reports?.filteredReports ?? [],
);

export const reportDetailSelector = createSelector(
  baseSelector,
  reports => reports?.reportDetail,
);

export const reportsPollingDataSelector = createSelector(
  baseSelector,
  reports => reports?.pollingData,
);

export const reportsSortOrderSelector = createSelector(
  baseSelector,
  reports => reports?.sortOrder,
);

export const reportsCategorySelector = createSelector(
  baseSelector,
  reports => reports?.category,
);

export const reportsMissionIdSelector = createSelector(
  baseSelector,
  reports => reports?.missionId,
);

export const reportsBoundingBoxSelector = createSelector(
  baseSelector,
  reports => reports?.boundingBox,
);

export const reportsMapFilterSelector = createSelector(
  baseSelector,
  reports => reports?.mapFilter,
);

export default reportsSlice.reducer;
