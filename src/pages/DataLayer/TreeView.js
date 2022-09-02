import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import moment from 'moment';
import { ListGroup, ListGroupItem, Collapse } from 'reactstrap';
import { fetchEndpoint } from '../../helpers/apiHelper';
import { useDispatch, useSelector } from 'react-redux';

import { getMetaData, resetMetaData } from '../../store/appAction';

const TreeView = ({ data, setCurrentLayer}) => {
  const [itemState, setItemState] = useState({});
  const [selectedLayer, setSelectedLayer] = useState({});
  const [tooltipInfo, setTooltipInfo] = useState(undefined);
  const [metaActive, setMetaActive] = useState('');
  const { metaData } = useSelector(state => state.dataLayer);
  const dispatch = useDispatch();

  useEffect(() => {
    //TODO: when single layer selected
    setCurrentLayer(selectedLayer);
  }, [selectedLayer]);

  useEffect(() => {
    if(!metaData){
      setMetaActive('');
    }
  }, [metaData]);

  const toggleExpandCollapse = id => {
    setItemState(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  }

  const onClickDLItem = (id, node) => {
    if(node.children){
      toggleExpandCollapse(id); 
      setMetaActive('');
      dispatch(resetMetaData());
    }
    else {
      setSelectedLayer(node);
    }
  }

  const toggleMetaInfo = (metaURL) => {
    if(!metaData){
      setMetaActive('alert-card-active');
      dispatch(getMetaData(metaURL))
    }
    else {
      dispatch(resetMetaData());
    }
  }

  const mapper = (nodes, parentId, lvl) => {
    return nodes?.map((node, index) => {
      
      const id = node.id;
      const tooltipDisplay = tooltipInfo || node.info
      const item =
        <>
          <ListGroupItem
            key={index + id}
            className={`dl-item ${node.children && itemState[id] || selectedLayer.id == node.id ? `${metaActive} selected` : ''} mb-2`}
            onClick={() => { onClickDLItem(id, node) }}
            onMouseEnter={async () => {
              setTooltipInfo(undefined);
              setTooltipInfo(await fetchEndpoint(node.info_url));
            }}
            onMouseLeave={() => setTooltipInfo(undefined)}
          >
            <>
              {
                node.children ?
                  <>
                    {(node.info || node.info_url) &&
                      <i data-tip data-for={`${parentId}-${index}-tooltip`} className='bx bx-info-circle font-size-16 me-1' />
                    }
                    <i className={`bx bx-caret-${itemState[id] ? 'down' : 'right'} font-size-16`} />
                    {node.text}
                  </>
                  :
                  <>
                    {(node.metadata_url) &&
                      <i className={`bx bx-file font-size-18 me-2 meta-icon ${metaActive ? 'text-primary': ''}`} onClick={()=>{toggleMetaInfo(node.metadata_url)}} />
                    }
                    {moment(node.text).format('LLL')}
                  </>
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
              class="alert-tooltip data-layers-alert-tooltip text-light"
            >
              {tooltipDisplay ?? 'Loading...'}
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
