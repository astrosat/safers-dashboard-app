import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { Badge, ListGroup, ListGroupItem, Collapse } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { fetchEndpoint } from '../../helpers/apiHelper';
import { deleteMapRequest, getAllMapRequests } from '../../store/datalayer/action';
import JsonFormatter from '../../components/JsonFormatter'

const PropsPanel = (node) => {
  const node2=node.node;
  if (!node2.parameters) return null;
  node2.parameters['geometry'] = node2?.geometry_wkt;
  return (
    <div className="props_box">
      <JsonFormatter  data={node2?.parameters} />
    </div>
  );
};

const OnDemandTreeView = ({ data, setCurrentLayer}) => {
  const dispatch = useDispatch();

  const [itemState, setItemState] = useState({});
  const [itemPropsState, setItemPropsState] = useState({});
  const [selectedLayer, setSelectedLayer] = useState({});
  const [tooltipInfo, setTooltipInfo] = useState(undefined);

  useEffect(() => {
    setCurrentLayer(selectedLayer);
  }, [selectedLayer]);

  const toggleExpandCollapse = id => {
    setItemState(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  }

  const toggleExpandCollapseProps = id => {
    setItemPropsState(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  }


  const mapper = (nodes, parentId, lvl) => {
    return nodes?.map((node, index) => {

      // use tree level to define main text
      const nodeTextByLevel = [
        node.title,
        `${node.title || node.key}`,
        `${node.datatype_id}: ${node.title}`
      ]
      node.text = nodeTextByLevel[lvl];

      const id = node.id ?? node.key;
      const tooltipDisplay = tooltipInfo || node.info;
      const item =
        <>
          <ListGroupItem
            key={index + id}
            className={`dl-item ${node.children && itemState[id] || selectedLayer.title == node.title ? 'selected' : ''} mb-2`}
            onClick={() => {
              return node.children ? toggleExpandCollapse(id) : setSelectedLayer(node)
            }}
            onMouseEnter={async () => {
              setTooltipInfo(undefined);
              if (node.info_url) {
                setTooltipInfo(await fetchEndpoint(node.info_url));
              }
            }}
            onMouseLeave={() => setTooltipInfo(undefined)}
          >
            <>
              {node.info_url &&
                <i data-tip data-for={`${parentId}-${index}-tooltip`} className='bx font-size-16 me-1' />
              }
              {
                node.children ?
                  <>
                    {node.info &&
                      <i data-tip data-for={`${parentId}-${index}-tooltip`} className='bx bx-info-circle font-size-16 me-1' />
                    }
                    <i className={`bx bx-caret-${itemState[id] ? 'down' : 'right'} font-size-16`} />
                    {node.text}
                  </>
                  :
                  <div className="on-demand-leaf">
                    <div>
                      {node.info_url &&
                        <i data-tip data-for={`${parentId}-${index}-tooltip`} className="bx bx-info-circle font-size-16 me-1" />
                      }
                      {node.text}
                    </div>
                    {node.status && (<Badge data-tip data-for={`${parentId}-${index}-status`} className='rounded-pill alert-badge event-alert-badge d-inline-flex justify-content-center align-items-center p-2'>
                      <span className={`${node.status?.toLowerCase()}`}>{node.status}</span>
                    </Badge>)}
                  </div>
              }
              { node?.parameters ? 
                <>
                  &nbsp;<i onClick={(event)=>{event.stopPropagation(); toggleExpandCollapseProps(id)} } className={'bx bx-cog font-size-16'} />
                  &nbsp;<i onClick={async (event)=> {
                    event.stopPropagation();
                    dispatch(deleteMapRequest(node.id))
                    dispatch(getAllMapRequests())
                  }} className="bx bx-trash font-size-16" />
                </> : null
              }
              { node?.parameters && itemPropsState[id]
                ? <div className="mt-2"><PropsPanel node={node} /></div>
                : null
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
              class="alert-tooltip data-layers-alert-tooltip"
            >
              {tooltipDisplay ?? 'Loading...'}
            </ReactTooltip>}
          {node.message &&
            <ReactTooltip id={`${parentId}-${index}-status`}
              aria-haspopup="true"
              place='right'
              class="alert-tooltip data-layers-alert-tooltip"
            >
              {node.message}
            </ReactTooltip>
          }
        </>
      return item;
    });
  }
  return (
    <ListGroup>
      {mapper(data, undefined, 0)}
    </ListGroup>
  )
}

OnDemandTreeView.propTypes = {
  data: PropTypes.any,
  setCurrentLayer: PropTypes.func,
  node: PropTypes.any,
}


export default OnDemandTreeView;
