import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { ListGroup, ListGroupItem, Collapse } from 'reactstrap';
import { fetchEndpoint } from '../../helpers/apiHelper';

const OnDemandTreeView = ({ data, setCurrentLayer}) => {
  const [itemState, setItemState] = useState({});
  const [selectedLayer, setSelectedLayer] = useState({});
  const [tooltipInfo, setTooltipInfo] = useState(undefined);

  useEffect(() => {
    //TODO: when single layer selected
    setCurrentLayer(selectedLayer);
  }, [selectedLayer]);

  const toggleExpandCollapse = id => {
    setItemState(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  }

  const mapper = (nodes, parentId, lvl) => {
    return nodes.map((node, index) => {

      // set children according to level. Prioritise leaf over branch or root
      //node.children = [...node.maplayers] || [...node.requests] || [...node] || [];
      if (!node.children) {
        node.children= node?.mapLayers || node?.requests || undefined;
      }
      
      node.text = node.category || node.name || node.id;
      node.info = 'I\'m a tooltip';
      //setTooltipInfo(node.info);
      console.log('Node', node);

      const id = node.id;
      const tooltipDisplay = tooltipInfo || node.category || node.id;
      const item =
        <>
          <ListGroupItem
            key={index + id}
            className={`dl-item ${node.children && itemState[id] || selectedLayer.id == node.id ? 'selected' : ''} mb-2`}
            onClick={() => {
              return node.children ? toggleExpandCollapse(id) : setSelectedLayer(node)
            }}
            onMouseEnter={async () => {
              setTooltipInfo(undefined);
              setTooltipInfo(await fetchEndpoint(node.info_url));
            }}
            onMouseLeave={() => setTooltipInfo(undefined)}
          >
            <>
              {(node.info || node.info_url) &&
                <i data-tip data-for={`${parentId}-${index}-tooltip`} className='bx bx-info-circle font-size-16 me-1' />
              }
              {
                node.children ?
                  <>
                    <i className={`bx bx-caret-${itemState[id] ? 'down' : 'right'} font-size-16`} />
                    {node.text}
                  </>
                  :
                  'Leaf node'
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

OnDemandTreeView.propTypes = {
  data: PropTypes.any,
  setCurrentLayer: PropTypes.func
}


export default OnDemandTreeView;