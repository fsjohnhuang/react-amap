import { useState, Children, cloneElement } from 'react'
import { useSetStatus, useEventProperties, useSettingProperties } from '../../utils'
import ReactAMapAdapter from './ReactAMapAdapter'

export default function useMap(props) {
  const {children, ...others} = props
  let {adapter, childs} = Children.toArray(children)
    .reduce((result, child) => {
      if ([child.type.attach, child.props.attach].indexOf('MapAdapter') !== -1) {
        result.adapter = child
      }
      else {
        result.childs.push(child)
      }

      return result
    }, {adapter: undefined, childs: []})

  const [map, setMap] = useState()

  if (adapter) {
    adapter = cloneElement(adapter, { onReady: setMap })
  }
  else {
    adapter = <ReactAMapAdapter {...others} onReady={setMap} />
  }

  useSetStatus(map, others, [
    'dragEnable',
    'zoomEnable',
    'jogEnable',
    'pitchEnable',
    'rotateEnable',
    'animateEnable',
    'keyboardEnable',
  ])

  useSettingProperties(map, others, [
    'Zoom',
    'LabelzIndex',
    'Layers',
    'City',
    'Bounds',
    'LimitBounds',
    'Lang',
    'Rotation',
    'DefaultCursor',
    'MapStyle',
    'Features',
    'DefaultLayer',
    'Pitch',
  ])

  useEventProperties(map, others, [
    'onMouseMove',
    'onZoomChange',
    'onMapMove',
    'onMouseWheel',
    'onZoomStart',
    'onMouseOver',
    'onMouseOut',
    'onDblClick',
    'onClick',
    'onZoomEnd',
    'onMoveEnd',
    'onMouseUp',
    'onMouseDown',
    'onRightClick',
    'onMoveStart',
    'onDragStart',
    'onDragging',
    'onDragEnd',
    'onHotspotOut',
    'onHotspotOver',
    'onTouchStart',
    'onComplete',
    'onHotspotClick',
    'onTouchMove',
    'onTouchEnd',
    'onResize',
  ])

  return { map, adapter, childs }
}