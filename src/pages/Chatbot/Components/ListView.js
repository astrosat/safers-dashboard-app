import React from 'react';

import PropTypes from 'prop-types';
import { Row } from 'reactstrap';

import PaginationWrapper from 'components/Pagination';
import { PAGE_SIZE } from 'constants/common';

const ListView = ({ items, selectedIndex, setPageData, children }) => {
  const pageNo = Math.ceil((selectedIndex + 1) / 4);

  return (
    <>
      {children}

      <Row className="text-center">
        <PaginationWrapper
          page={pageNo}
          pageSize={PAGE_SIZE}
          list={items}
          setPageData={setPageData}
        />
      </Row>
    </>
  );
};

ListView.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  selectedIndex: PropTypes.number,
  setPageData: PropTypes.func,
  children: PropTypes.any,
};

export default ListView;
