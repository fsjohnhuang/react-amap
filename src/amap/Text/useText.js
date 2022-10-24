import { useState, useEffect } from 'react'
import { useVisible, useSettingProperties, useEventProperties, usePortal } from '../../utils'
import { useAMap, useMap } from '../../hooks'

export default function useText(props) {
  const {visible, children, ...others} = props
  const { AMap } = useAMap()
  const { map } = useMap()
  const [text, setText] = useState()
  const {Portal, anchor, setAnchorMounted} = usePortal()

  useEffect(() => {
    if (AMap && map) {
      const instance = new AMap.Text({
        ...props, // only the changes of props after intialization wouldn't cause effect function fire again
        map
      })
      setText(instance)

      return () => {
        instance.remove()
        setText(null)
      }
    }
  }, 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [AMap, map])

  useEffect(() => {
    if (text) {
      text.setText(anchor.outerHTML)
      setAnchorMounted(true)
    }
  }, [text, anchor, setAnchorMounted])

  useVisible(text, visible)

  useSettingProperties(
    text,
    others,
    [
      'Text',
      'Style',
      'Title',
      'Clickable',
      'Map',
      'Position',
      'Anchor',
      'Offset',
      'Angle',
      'zIndex',
      'Top',
      'Cursor',
      'ExtData'
    ]
  )
  useEventProperties(
    text,
    others,
    [
      'onMoving',
      'onTouchMove',
      'onTouchEnd',
      'onMoveLong',
      'onTouchStart',
      'onMoveEnd',
      'onClick',
      'onDblClick',
      'onRightClick',
      'onMouseMove',
      'onMouseOver',
      'onMouseOut',
      'onMouseDown',
      'onMouseUp',
      'onDragStart',
      'onDragEnd',
      'onDragging',
    ]
  )

  return {
    text,
    Portal
  }
}