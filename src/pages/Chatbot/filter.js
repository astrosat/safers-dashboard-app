/* Chatbot - front-end filtering/sorting */
/* Note: Only Date and Geometry related data filtered on backend */

import _ from 'lodash';

export const getFilteredRec = (allRecords, filters, sort) => {
  let actFiltered = [...allRecords];
  const filterNames = Object.keys(filters);
  filterNames.forEach((key) => {
    if(filters[key] !== ''){
      actFiltered = actFiltered.filter((o) => o[key] == filters[key]);
    }
  });
  actFiltered = _.orderBy(actFiltered , [(o) => new Date(o[sort.fieldName])], [sort.order]);
  return actFiltered;
}