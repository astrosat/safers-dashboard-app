import { CompositeLayer } from '@deck.gl/core';
import { IconLayer, TextLayer } from '@deck.gl/layers';
import { color } from 'd3-color';
import { get, isArray } from 'lodash';
import Supercluster from 'supercluster';

import backgroundsIconAtlas from '../../assets/images/mappins/safers-pins.svg';
import backgroundsIconMapping from '../../assets/images/mappins/safers-pins.json';
import iconAtlas from '../../assets/images/mappins/safers-icons.svg';
import iconMapping from '../../assets/images/mappins/safers-icons.json';

const COLOR_TRANSPARENT = [0, 0, 0, 0],
  COLOR_PRIMARY = [246, 190, 0, 255],
  COLOR_SECONDARY = [51, 63, 72, 255];

export class PinLayer extends CompositeLayer {

  _getPixelOffset(feature) {
    // used to offset text/icons relative to pin anchor point
    if (typeof this.props.getPixelOffset === 'function') {
      return this.props.getPixelOffset(feature)
    }
    return this.props.pixelOffset ? this.props.pixelOffset : [0,0];
  }

  _getExpansionZoom(feature) {
    return this.state.index.getClusterExpansionZoom(
      feature.properties.cluster_id
    );
  }

  _injectExpansionZoom(feature) {
    return {
      ...feature,
      properties: {
        ...feature.properties,
        expansion_zoom: this._getExpansionZoom(feature),
      },
    };
  }

  shouldUpdateState({ changeFlags }) {
    return changeFlags.somethingChanged;
  }

  updateState({ props, oldProps, changeFlags }) {
    const rebuildIndex =
      changeFlags.dataChanged || props.sizeScale !== oldProps.sizeScale;
    if (rebuildIndex) {
      const index = new Supercluster({
        maxZoom: this.props.maxZoom || 16,
        radius: this.props.clusterRadius,
      });
      index.load(
        props.data.map((d) => ({
          geometry: { coordinates: this.props.getPosition(d) },
          properties: d.properties,
        }))
      );
      this.setState({ index });
    }

    const zoom = Math.ceil(this.context.viewport.zoom);
    if (rebuildIndex || zoom !== this.state.zoom) {
      this.setState({
        data: this.state.index.getClusters([-180, -85, 180, 85], zoom),
        zoom,
      });
    }
  }

  getPickingInfo({ info, mode }) {
    if (info.picked) {
      if (info.object.properties.cluster) {
        info.object.properties.expansion_zoom = this._getExpansionZoom(
          info.object
        );
        if (mode !== 'hover') {
          info.objects = this.state.index.getLeaves(
            info.object.properties.cluster_id,
            Infinity
          );
        }
      }
    }
    return info;
  }

  // ===== Pin/Cluster Layer Functions =====
  _getPinIcon(feature) {
    if (
      feature.properties.cluster &&
      this._getExpansionZoom(feature) <= this.props.maxZoom
    ) {
      return 'cluster';
    }
    return 'pin';
  }

  _getPinLayerIconSize(feature) {
    if (
      feature.properties.cluster &&
      this._getExpansionZoom(feature) <= this.props.maxZoom
    ) {
      return this.props.clusterIconSize;
    }
    return typeof this.props.getPinSize === 'function'
      ? this.props.getPinSize(feature)
      : this.props.getPinSize;
  }

  _getPinColor(feature) {
    if (
      feature.properties.cluster &&
      this._getExpansionZoom(feature) <= this.props.maxZoom
    )
      return COLOR_PRIMARY;
    if (typeof this.props.getPinColor === 'function') {
      const { index } = this.state;
      const leaves = index.getLeaves(feature.properties.cluster_id)
      return this.props.getPinColor(feature, leaves);
    }
    if (isArray(this.props.pinColor)) return this.props.pinColor;
    const colorInstance = color(this.props.pinColor);
    const { r, g, b } = colorInstance.rgb();
    return [r, g, b];
  }

  // ===== Icon Layer Functions =====
  _getIcon(feature) {
    if (
      feature.properties.cluster &&
      this._getExpansionZoom(feature) > this.props.maxZoom
    )
      return 'group';
    if (this.props.icon) return this.props.icon;
    if (this.props.iconProperty)
      return get(feature.properties, this.props.iconProperty)
        ?.toLowerCase()
        .replace(' ', '-');
    return undefined;
  }

  _getIconColor(feature) {
    if (
      feature.properties.cluster &&
      this._getExpansionZoom(feature) <= this.props.maxZoom
    ) {
      return COLOR_TRANSPARENT;
    }
    if (isArray(this.props.iconColor)) return this.props.iconColor;
    if (typeof this.props.iconColor === 'string') {
      const colorInstance = color(this.props.iconColor);
      const { r, g, b } = colorInstance.rgb();
      return [r, g, b];
    }
    return [255, 255, 255, 255];
  }

  // ===== Text Layer Functions =====

  _getTextColor(feature) {
    if (
      feature.properties.cluster &&
      this._getExpansionZoom(feature) > this.props.maxZoom
    )
      return COLOR_TRANSPARENT;

    return COLOR_SECONDARY;
  }

  renderLayers() {
    const { data } = this.state;
    return [
      new IconLayer(
        this.getSubLayerProps({
          id: `${this.props.id}-pin`,
          data,
          iconAtlas: backgroundsIconAtlas,
          iconMapping: backgroundsIconMapping,
          getPosition: this.props.getPosition,
          getIcon: (d) => this._getPinIcon(d),
          getSize: (d) => this._getPinLayerIconSize(d),
          getColor: (d) => this._getPinColor(d),
          updateTriggers: {
            getPosition: this.props.updateTriggers.getPosition,
            getIcon: this.props.updateTriggers.getIcon,
            getSize: this.props.updateTriggers.getIconSize,
            getColor: this.props.updateTriggers.getIconColor,
          },
        })
      ),
      new IconLayer(
        this.getSubLayerProps({
          id: `${this.props.id}-icon`,
          data,
          iconAtlas,
          iconMapping,
          getPosition: this.props.getPosition,
          getPixelOffset: (d) => this._getPixelOffset(d),
          getIcon: (d) => this._getIcon(d),
          getColor: (d) => this._getIconColor(d),
          getSize: (d) => this._getPinLayerIconSize(d) / 2,
        })
      ),
      new TextLayer(
        this.getSubLayerProps({
          id: `${this.props.id}-text`,
          data,
          fontFamily: this.props.fontFamily,
          fontWeight: this.props.fontWeight,
          getPosition: this.props.getPosition,
          getPixelOffset: () => this._getPixelOffset(),
          getText: (feature) =>
            feature.properties.cluster
              ? `${feature.properties.point_count}`
              : ' ',
          getSize: this.props.getTextSize,
          getColor: (feature) => this._getTextColor(feature),
          updateTriggers: {
            getPosition: this.props.updateTriggers.getPosition,
            getText: this.props.updateTriggers.getText,
            getSize: this.props.updateTriggers.getTextSize,
            getColor: this.props.updateTriggers.getTextColor,
          },
        })
      ),
    ];
  }
}

PinLayer.layerName = 'PinLayer';
PinLayer.defaultProps = {
  // Shared accessors
  pickable: true,
  getPosition: { type: 'accessor', value: (x) => x.position },
  // ===== Pin/Cluster Layer Props =====
  // accessors
  getPinSize: { type: 'accessor', value: 80 },
  pinColor: { type: 'accessor', value: COLOR_PRIMARY },
  // ===== Icon Layer Props =====
  icon: { type: 'accessor', value: null },
  iconProperty: { type: 'accessor', value: 'icon' },
  iconColor: { type: 'accessor', value: COLOR_SECONDARY },
  // ===== Text Layer Props =====
  // properties
  fontFamily: 'Open Sans',
  fontWeight: 600,
  // accessors
  getTextSize: { type: 'accessor', value: 32 },
  // ===== Clustering properties =====
  maxZoom: 20,
  clusterRadius: 70,
  clusterIconSize: 80,
};
