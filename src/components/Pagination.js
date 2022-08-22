import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import Pagination from 'rc-pagination';

const PaginationWrapper = ({list, pageSize, setPageData}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const updatePage = page => {
    const to = pageSize * page;
    const from = to - pageSize;
    setCurrentPage(page);
    const pageData = _.cloneDeep(list.slice(from, to));
    setPageData(pageData);
  };

  useEffect(() => {
    //Always set the default page to first if the list is updated
    updatePage(1);
  }, [list]);

  
  return  <Pagination
    pageSize={pageSize}
    onChange={updatePage}
    current={currentPage}
    total={list.length}
  />
}

PaginationWrapper.propTypes = {
  list: PropTypes.array,
  pageSize: PropTypes.number,
  setPageData: PropTypes.func
}

export default PaginationWrapper;
