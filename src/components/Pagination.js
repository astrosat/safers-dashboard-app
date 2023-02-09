import React, { useState, useEffect } from 'react';

import _ from 'lodash';
import PropTypes from 'prop-types';
import Pagination from 'rc-pagination';

const PaginationWrapper = ({ page = 1, list, pageSize, setPageData }) => {
  const [currentPage, setCurrentPage] = useState(page);
  console.log('CURRENT PAGE: ', currentPage, page);
  // setCurrentPage(page);

  const updatePage = page => {
    const to = pageSize * page;
    const from = to - pageSize;
    setCurrentPage(page);
    const pageData = _.cloneDeep(list.slice(from, to));
    setPageData(pageData);
  };

  useEffect(() => setCurrentPage(page), [page]);

  useEffect(() => {
    //Always set the default page to first if the list is updated
    updatePage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  return (
    <Pagination
      pageSize={pageSize}
      onChange={updatePage}
      current={currentPage}
      total={list.length}
    />
  );
};

PaginationWrapper.propTypes = {
  list: PropTypes.array,
  pageSize: PropTypes.number,
  setPageData: PropTypes.func,
};

export default PaginationWrapper;
