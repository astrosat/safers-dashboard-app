import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { ListGroup, ListGroupItem, Collapse } from 'reactstrap';
import { fetchEndpoint } from '../../helpers/apiHelper';


const formatParameter = (node, key) => {
  let value = '';
  if (typeof node.parameters[key]==='object') {
    value = JSON.stringify(node.parameters[key], null, 2);
  } else {
    value = `${node.parameters[key]}`
  }
  return `${key} : ${value}`
}

const PropsPanel = (node) => {
  const node2=node.node;
  if (!node2.parameters) return null;
  node2.parameters['geometry'] = node2?.geometry_wkt;
  const parameters = Object.keys(node2.parameters);
  console.log('node is ==>', node);
  console.log('paramaters is ==>', parameters);
  // TODO: get a better key once we have node numbering from backend
  const paramaters = parameters.map((key,ix)=><div className="props-line" key={ix}>{formatParameter(node2, key)}</div>) ;
  return (
    <div className="props-box">
      {paramaters}
    </div>
  )
};

const OnDemandTreeView = ({ data, setCurrentLayer}) => {
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


  // TODO this is a temporary thing to let me continue working while
  // waiting on the API to be developed. It looks up the data layer name from
  // the code, and injects a random status

  // const MOCK_LEAF_NODE = (node) => {
  //   const lookup_table = [
  //     {id: '36004', name:'Impact quantification'},
  //     {id: '36005', name:'Fire front and smoke'},
  //     {id: '36003', name:'Burned area geospatial image'},
  //     {id: '36002', name:'Burned area severity map'},
  //     {id: '36001', name:'Burned area delineation map'},
  //     {id: '37006', name: 'Generate vegetation recovery map'},
  //     {id: '37005', name: 'Generate historical severity map (dNBR)'},
  //     {id: '37004', name: 'Provide landslide susceptibility information'},
  //     {id: '37003', name: 'Generate soil recovery map (Vegetation Index)'},
  //     {id: '37002', name: 'Generate burn severity map (dNBR)'},
  //     {id: '32005', name: 'Get critical points of infrastructure, e.g. airports, motorways, hospitals, etc.'},
  //     {id: '35006', name:'Fire Simulation'},
  //     {id: '35011', name:'Max rate of spread'},
  //     {id: '35010', name:'Mean rate of spread'},
  //     {id: '35009', name:'Max fireline intensity'},
  //     {id: '35008', name:'Mean fireline intensity'},
  //     {id: '35007', name:'Fire perimeter simulation as isochrones maps'},
  //   ];
  //   let name = lookup_table.find(item=>item.id === node.datatype_id);
  //   if (name) {
  //     name=name.name;
  //   }
  //   const statuses = ['IN PROGRESS', 'FAILED', 'SUCCESS']
  //   const status = statuses[_.random(0,2)];
  //   return {name, status};
  // }

  const mapper = (nodes, parentId, lvl) => {
    return nodes?.map((node, index) => {

      // set children according to level. Prioritise leaf over branch or root
      if (!node.children) {
        node.children= node?.layers || node?.requests || undefined;
      }
      
      //const mockleafnode = MOCK_LEAF_NODE(node);

      // use tree level to define main text
      const nodeTextByLevel = [
        `${node.key} : ${node.category}`,
        `${node.key} : ${node.title || node.id}`,
        //`${node.key} : ${node.datatype} [${node.status}]`
        `${node.key} : ${node.datatype_id}: DATA_LAYER_NAME [STATUS}]`
      ]
      node.text = nodeTextByLevel[lvl];
      //console.log('Node', node);
      node.info = 'I\'m a tooltip';

      const id = node.id ?? node.key;
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
                <i data-tip data-for={`${parentId}-${index}-tooltip`} className='bx font-size-16 me-1' />
              }
              {
                node.children ?
                  <>
                    <i className={`bx bx-caret-${itemState[id] ? 'down' : 'right'} font-size-16`} />
                    {node.text}
                  </>
                  :
                  node.text
              }
              { node?.parameters ? 
                <>
                  &nbsp;<i onClick={(event)=>{event.stopPropagation(); toggleExpandCollapseProps(id)} } className={'bx bx-cog font-size-16'} />
                </> : null
              }
              { node?.parameters &&  itemPropsState[id] ?  <div className="mt-2"><PropsPanel node={node} /></div>: null}
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
