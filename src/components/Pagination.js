import React, { useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import Pagination from 'rc-pagination';

const PaginationWrapper = ({ page = 1, list, pageSize, setPageData }) => {
  const [currentPage, setCurrentPage] = useState(page);

  const updatePage = page => {
    const to = pageSize * page;
    const from = to - pageSize;
    setCurrentPage(page);
    const pageData = list.slice(from, to);

    setPageData(pageData);
  };

  useEffect(() => {
    updatePage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

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
