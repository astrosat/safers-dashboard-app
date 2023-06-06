import { rest } from 'msw';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { BAD_REQUEST } from 'api/constants';
import { server } from 'mocks/server';
import { getFilteredRecords } from 'pages/Chatbot/filter';

import reducer, {
  initialState,
  fetchReports,
  fetchReportDetail,
  refreshReports,
  setFilteredReports,
  allReportsSelector,
  filteredReportsSelector,
  reportDetailSelector,
  reportsPollingDataSelector,
  reportsSortOrderSelector,
  reportsCategorySelector,
  reportsMissionIdSelector,
  reportsBoundingBoxSelector,
  reportsMapFilterSelector,
} from './reports.slice';

const mockStore = configureMockStore([thunk]);

describe('Reports Slice', () => {
  describe('Thunks', () => {
    describe('fetchReports', () => {
      let store = null;
      let options = null;
      let isPolling = null;

      beforeEach(() => {
        store = mockStore();
        options = {};
        isPolling = false;
      });

      it('should dispatch fetch reports failure', async () => {
        server.use(
          rest.get('*/api/chatbot/reports', (req, res, ctx) =>
            res(ctx.status(BAD_REQUEST, 'Test Error')),
          ),
        );

        const expectedActions = expect.arrayContaining([
          expect.objectContaining({
            type: fetchReports.rejected.type,
          }),
        ]);

        await store.dispatch(fetchReports({ options, isPolling }));

        expect(store.getActions()).toEqual(expectedActions);
      });

      it('should dispatch fetch reports success', async () => {
        const reports = [
          {
            id: 1,
          },
          {
            id: 2,
          },
          {
            id: 3,
          },
          {
            id: 4,
          },
        ];

        server.use(
          rest.get('*/api/chatbot/reports', (req, res, ctx) => {
            return res(ctx.status(200), ctx.json(reports));
          }),
        );

        const expectedActions = expect.arrayContaining([
          expect.objectContaining({
            type: fetchReports.fulfilled.type,
            payload: {
              isPolling,
              data: reports,
            },
          }),
        ]);

        await store.dispatch(fetchReports({ options, isPolling }));

        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    describe('fetchReportDetail', () => {
      let store = null;

      beforeEach(() => {
        store = mockStore();
      });

      it('should dispatch fetch report detail failure', async () => {
        server.use(
          rest.get('*/api/chatbot/reports/test-id', (req, res, ctx) =>
            res(ctx.status(BAD_REQUEST, 'Test Error')),
          ),
        );

        const expectedActions = expect.arrayContaining([
          expect.objectContaining({
            type: fetchReportDetail.rejected.type,
          }),
        ]);

        await store.dispatch(fetchReportDetail('test-id'));

        expect(store.getActions()).toEqual(expectedActions);
      });

      it('should dispatch fetch report detail success', async () => {
        const reportDetail = {
          id: 'test-id',
        };

        server.use(
          rest.get('*/api/chatbot/reports/test-id', (req, res, ctx) => {
            return res(ctx.status(200), ctx.json(reportDetail));
          }),
        );

        const expectedActions = expect.arrayContaining([
          expect.objectContaining({
            type: fetchReportDetail.fulfilled.type,
            payload: {
              data: reportDetail,
            },
          }),
        ]);

        await store.dispatch(fetchReportDetail('test-id'));

        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  describe('Reducer', () => {
    let beforeState = null;

    beforeEach(() => {
      beforeState = initialState;
    });

    it('should return the initial state', () => {
      const actualState = reducer(undefined, {});
      expect(actualState).toEqual(expect.objectContaining(beforeState));
    });

    describe('refreshReports', () => {
      it('should set report state to that passed in as the payload', () => {
        const allReports = [{ id: 1 }, { id: 2 }];
        const actualState = reducer(beforeState, refreshReports(allReports));

        expect(actualState).toEqual({
          ...initialState,
          allReports,
          error: false,
        });
      });
    });

    describe('setFilteredReports', () => {
      it('should set filtered reports', () => {
        const payload = {
          data: [{ id: 3 }, { id: 4 }],
          filterParams: {
            missionId: true,
            category: 'damages',
            sortOrder: 'asc',
            boundingBox: [0, 0, 1, 1],
            mapFilter: { midPoint: [], currentZoomLevel: null },
          },
        };
        const actualState = reducer(beforeState, setFilteredReports(payload));

        expect(actualState).toEqual({
          ...initialState,
          filteredReports: payload.data,
          ...payload.filterParams,
          error: false,
        });
      });
    });

    describe('fetchReports', () => {
      it('should handle error when report fetching is rejected', () => {
        const actualState = reducer(beforeState, {
          type: fetchReports.rejected.type,
        });

        expect(actualState.error).toBe(true);
      });

      it('should set reports when polling successfully retrieved', () => {
        const payload = {
          isPolling: true,
          data: [{ id: 3 }, { id: 4 }],
        };

        const actualState = reducer(beforeState, {
          type: fetchReports.fulfilled.type,
          payload,
        });

        expect(actualState).toEqual({
          ...initialState,
          pollingData: payload.data,
          error: false,
        });
      });

      it('should set reports when successfully retrieved', () => {
        const payload = {
          isPolling: false,
          data: [{ id: 3 }, { id: 4 }],
        };
        const filtered = getFilteredRecords(
          payload.data,
          { category: beforeState.category },
          { sortOrder: beforeState.sortOrder },
        );

        const actualState = reducer(beforeState, {
          type: fetchReports.fulfilled.type,
          payload,
        });

        expect(actualState).toEqual({
          ...initialState,
          filteredReports: filtered,
          allReports: payload.data,
          error: false,
        });
      });
    });

    describe('fetchReportDetail', () => {
      it('should handle error when report fetching is rejected', () => {
        const actualState = reducer(beforeState, {
          type: fetchReportDetail.rejected.type,
        });

        expect(actualState.error).toBe(true);
      });

      it('should set report detail when successfully retrieved', () => {
        const payload = {
          data: [{ id: 3 }, { id: 4 }],
        };

        const actualState = reducer(beforeState, {
          type: fetchReportDetail.fulfilled.type,
          payload,
        });

        expect(actualState).toEqual({
          ...initialState,
          reportDetail: payload.data,
          error: false,
        });
      });
    });
  });

  describe('Selectors', () => {
    describe('allReportsSelector', () => {
      it('should return false if state is undefined', () => {
        const result = allReportsSelector(undefined);
        expect(result).toBe(undefined);
      });

      it('should return all reports', () => {
        const allReports = [{ id: 1 }, { id: 2 }];
        const state = {
          reports: {
            ...initialState,
            allReports,
          },
        };

        const result = allReportsSelector(state);
        expect(result).toBe(allReports);
      });
    });

    describe('filteredReportsSelector', () => {
      it('should return false if state is undefined', () => {
        const result = filteredReportsSelector(undefined);
        expect(result).toEqual([]);
      });

      it('should return filtered reports', () => {
        const filteredReports = [{ id: 1 }, { id: 2 }];
        const state = {
          reports: {
            ...initialState,
            filteredReports,
          },
        };

        const result = filteredReportsSelector(state);
        expect(result).toBe(filteredReports);
      });
    });

    describe('reportDetailSelector', () => {
      it('should return false if state is undefined', () => {
        const result = reportDetailSelector(undefined);
        expect(result).toEqual(undefined);
      });

      it('should return a single report detail', () => {
        const reportDetail = { id: 1 };
        const state = {
          reports: {
            ...initialState,
            reportDetail,
          },
        };

        const result = reportDetailSelector(state);
        expect(result).toBe(reportDetail);
      });
    });

    describe('reportsPollingDataSelector', () => {
      it('should return false if state is undefined', () => {
        const result = reportsPollingDataSelector(undefined);
        expect(result).toEqual(undefined);
      });

      it('should return polled reports', () => {
        const pollingData = [{ id: 1 }];
        const state = {
          reports: {
            ...initialState,
            pollingData,
          },
        };

        const result = reportsPollingDataSelector(state);
        expect(result).toBe(pollingData);
      });
    });

    describe('reportsSortOrderSelector', () => {
      it('should return false if state is undefined', () => {
        const result = reportsSortOrderSelector(undefined);
        expect(result).toEqual(undefined);
      });

      it('should return current selected reports sort order', () => {
        const sortOrder = 'asc';
        const state = {
          reports: {
            ...initialState,
            sortOrder,
          },
        };

        const result = reportsSortOrderSelector(state);
        expect(result).toBe(sortOrder);
      });
    });

    describe('reportsCategorySelector', () => {
      it('should return false if state is undefined', () => {
        const result = reportsCategorySelector(undefined);
        expect(result).toEqual(undefined);
      });

      it('should return current selected reports category filter', () => {
        const category = 'damages';
        const state = {
          reports: {
            ...initialState,
            category,
          },
        };

        const result = reportsCategorySelector(state);
        expect(result).toBe(category);
      });
    });

    describe('reportsMissionIdSelector', () => {
      it('should return false if state is undefined', () => {
        const result = reportsMissionIdSelector(undefined);
        expect(result).toEqual(undefined);
      });

      it('should return if it should filter reports associated with a mission', () => {
        const missionId = true;
        const state = {
          reports: {
            ...initialState,
            missionId,
          },
        };

        const result = reportsMissionIdSelector(state);
        expect(result).toBe(missionId);
      });
    });

    describe('reportsBoundingBoxSelector', () => {
      it('should return false if state is undefined', () => {
        const result = reportsBoundingBoxSelector(undefined);
        expect(result).toEqual(undefined);
      });

      it('should return the bbox used to filter reports', () => {
        const boundingBox = [0, 0, 1, 1];
        const state = {
          reports: {
            ...initialState,
            boundingBox,
          },
        };

        const result = reportsBoundingBoxSelector(state);
        expect(result).toBe(boundingBox);
      });
    });

    describe('reportsMapFilterSelector', () => {
      it('should return false if state is undefined', () => {
        const result = reportsMapFilterSelector(undefined);
        expect(result).toEqual(undefined);
      });

      it('should return report map filters', () => {
        const state = {
          reports: {
            ...initialState,
          },
        };

        const result = reportsMapFilterSelector(state);
        expect(result).toBe(initialState.mapFilter);
      });
    });
  });
});
