import { useState, useEffect } from 'react'
import { useVisible, useSettingProperties, useEventProperties, usePortal } from '../../utils'
import { useAMap, useMap } from '../../hooks'

export default function useMarker(props) {
  const {visible = true, animate, children, ...others} = props
  const { AMap } = useAMap()
  const { map } = useMap()
  const [marker, setMarker] = useState()
  const { Portal, anchor, setAnchorMounted } = usePortal()

  useEffect(() => {
    if (AMap && map) {
      const instance = new AMap.Marker({
        ...props, // only the changes of props after intialization wouldn't cause effect function fire again
        map
      })
      setMarker(instance)

      return () => {
        instance.remove()
        setMarker(null)
      }
    }
  }, 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [AMap, map])

  useEffect(() => {
    if (marker) {
      marker.setContent(anchor.outerHTML)
      setAnchorMounted(true)
    }
  }, 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [marker])

  useVisible(marker, visible)

  useSettingProperties(
    marker,
    others,
    [
      'Path',
      'Anchor',
      'Offset',
      'Animation',
      'Clickable',
      'Position',
      'Angle',
      'Label',
      'zIndex',
      'Icon',
      'Draggable',
      'Cursor',
      'Content',
      'Map',
      'Title',
      'Top',
      'Shadow',
      'Shape',
      'ExtData',
    ]
  )
  useEventProperties(
    marker,
    others,
    [
      'onClick',
      'onDblClick',
      'onRightClick',
      'onMouseMove',
      'onMouseOver',
      'onMouseOut',
      'onMouseDown',
      'onMouseUp',
      'onDragStart',
      'onDragging',
      'onDragEnd',
      'onMoving',
      'onMoveEnd',
      'onMoveAlong',
      'onTouchStart',
      'onTouchMove',
      'onTouchEnd',
    ]
  )

  return {
    marker,
    Portal
  }
}