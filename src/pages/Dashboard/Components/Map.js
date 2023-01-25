import React , { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Row } from 'reactstrap';
import BaseMap from '../../../components/BaseMap/BaseMap';
import { getBoundedViewState, getPolygonLayer } from '../../../helpers/mapHelper';
import { getViewState } from '../../../helpers/mapHelper';
import PropTypes from 'prop-types';
import { getEventIconLayer } from '../../../helpers/mapHelper';
import { useMap } from '../../../components/BaseMap/MapContext';
import { BitmapLayer } from 'deck.gl';

const getBitmapLayer = (selectedLayer) => {
  /*
     extract bounds from url, this is passed in as an object with timestamps
     as the keys and urls as the values. Only going to show first one for now
    */
  const firstURL = Object.values(selectedLayer.urls)[0];
  const urlSearchParams = new URLSearchParams(firstURL);
  const urlParams = Object.fromEntries(urlSearchParams.entries());
  const bounds = urlParams?.bbox ? urlParams.bbox.split(',').map(Number) : selectedLayer.bbox;
  console.log(`image at bounds ${bounds}`)
  console.log(`imageURL ${firstURL}`)
  return new BitmapLayer({
    id: 'bitmap-layer',
    bounds: bounds,
    image: firstURL,
    //image:'http://placekitten.com/200/300',
    opacity: 1.0
  });
}


const MapComponent = ({ selectedLayer, viewMode, eventList }) => {
  const objAoi = useSelector(state => state.user.defaultAoi);
  const { deckRef } = useMap();

  let [layers, setLayers] = useState([]);
  let [viewState, setViewState] = useState({});
  
  useEffect(() => {
    let displayLayers = []; // QQQ

    if(!viewState || viewState==={} || viewMode==='userAOI') {
      // default mode is to show user's home AOI 
      console.log('objAoi', objAoi);
      setViewState(getViewState(objAoi.features[0].properties.midPoint, objAoi.features[0].properties.zoomLevel));
      displayLayers.push(getPolygonLayer(objAoi));
      displayLayers.push(getEventIconLayer(eventList));
    } 

    if (viewMode==='featureAOI') {
      // this mode is activated when user selects a layer in the pulldown list
      // show feature AOI instead, and overlay the raster
      let bbox = selectedLayer.bbox;
      viewState = getBoundedViewState(deckRef, bbox); 
      const reshapedLayer = {
        features: [
          {geometry: selectedLayer.geometry.geometries[0],}
        ]
      }
      displayLayers.push(getPolygonLayer(reshapedLayer));    
      if (selectedLayer.urls) {
        displayLayers.push(getBitmapLayer(selectedLayer));
      }
    }  
    setLayers(displayLayers);
  }, []);

  useEffect(() => {
    console.log('viewState now', viewState);
  }, [viewState]);

  useEffect(() => {
    console.log('viewMode now', viewMode);
  }, [viewState]);

  useEffect(() => {
    console.log('layers now', layers);
  }, [layers]);

  return (
    <Card className='map-card'>
      <Row style={{ height: 550 }} className="mx-auto">
        {viewState ? 
          <BaseMap 
            layers={layers} 
            initialViewState={viewState} 
            screenControlPosition="top-right"
            navControlPosition="bottom-right"
          />
          : <p>Nothing to see yet...</p>
        }
      </Row>
    </Card>

  );
}

MapComponent.propTypes = {
  selectedLayer: PropTypes.object,
  viewMode: PropTypes.string,
  eventList: PropTypes.arrayOf(PropTypes.any),
}

export default MapComponent;
