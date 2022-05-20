import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import moment from 'moment';
import { ListGroup, ListGroupItem, Collapse } from 'reactstrap';
import { fetchEndpoint } from '../../helpers/apiHelper';
import { debounce } from 'lodash';

const TreeView = ({ data, setCurrentLayer }) => {
  const [itemState, setItemState] = useState({});
  const [selectedLayer, setSelectedLayer] = useState({});
  const [tooltipInfo, setTooltipInfo] = useState(undefined);

  useEffect(() => {
    //TODO: when single layer selected
    setCurrentLayer(selectedLayer);
  }, [selectedLayer]);

  const toggleExpandCollapse = id => {
    //const id = e.target.id;
    setItemState(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  }

  const delayedFetchEndpoint = useCallback(debounce(q => fetchEndpoint(q), 500), []);

  const mapper = (nodes, parentId, lvl) => {
    return nodes.map((node, index) => {
      const id = node.id;
      const item =
        <>
          <ListGroupItem
            key={index + id}
            className={`dl-item ${node.children && itemState[id] || selectedLayer.id == node.id ? 'selected' : ''} mb-2`}
            onClick={() => {
              node.children ? toggleExpandCollapse(id) : setSelectedLayer(node)
            }}
          >
            <>
              <i data-tip data-for={`${parentId}-${index}-tooltip`} className='bx bx-info-circle font-size-16 me-1'
                onMouseEnter={async () => {
                  setTooltipInfo(undefined);
                  setTooltipInfo(await delayedFetchEndpoint(node.info_url));
                }}
                onMouseLeave={() => setTooltipInfo(undefined)}
              />
              {
                node.children ?
                  <>
                    <i className={`bx bx-caret-${itemState[id] ? 'down' : 'right'} font-size-16`} />
                    {node.text}
                  </>
                  :
                  moment(node.text).format('LLL')
              }
            </>
          </ListGroupItem>
          {
            node.children && id &&
            <Collapse
              key={index + id + '-' + lvl}
              isOpen={itemState[id] || false}
              className='dl-tree-collapse ms-5'
            >
              {mapper(node.children, id, (lvl || 0) + 1)}
            </Collapse>
          }
          {(node.info || node.info_url) &&
            <ReactTooltip id={`${parentId}-${index}-tooltip`}
              aria-haspopup="true"
              role={tooltipInfo || node.info}
              place='right'
              class="alert-tooltip text-light"
            >
              <p className='mb-2'>{tooltipInfo || node.info}</p>
            </ReactTooltip>}
        </>
      return item;
    });
  }
  return (
    <ListGroup>
      {mapper(data)}
    </ListGroup>
  )
}

TreeView.propTypes = {
  data: PropTypes.any,
  setCurrentLayer: PropTypes.func
}


export default TreeView;
