import { BitmapLayer, CompositeLayer, TileLayer } from 'deck.gl';

export class TiledRasterLayer extends CompositeLayer {
  renderLayers() {
    return [
      new TileLayer({
        data: this.props.data,
        opacity: this.props.opacity,
        minZoom: 0,
        maxZoom: 20,
        tileSize: 256,
        updateTriggers: {
          getTileData: { data: this.props.data },
        },
        renderSubLayers: props => {
          const {
            bbox: { west, south, east, north },
          } = props.tile;

          return new BitmapLayer(props, {
            data: null,
            image: props.data,
            bounds: [west, south, east, north],
          });
        },
      }),
    ];
  }
}

TiledRasterLayer.layerName = 'TiledRasterLayer';

TiledRasterLayer.defaultProps = {
  // BitmapLayer properties
  data: null,
  opacity: 1.0,
  bounds: { type: 'object', value: [], async: true },
};
