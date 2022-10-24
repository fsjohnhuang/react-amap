import { useEffect, useState } from 'react'
import { useAMap, useMap } from '../../hooks'
import { useEventProperties, useSettingProperties, useVisible, useData } from '../../utils'

export default function useMassMarks(props) {
  const { visible = true, data, zIndex, opacity, zooms, cursor, alwaysRender, style, ...others } = props

  const { AMap } = useAMap()
  const { map } = useMap()
  const [instance, setInstance] = useState()

  useEffect(() => {
    if (AMap && map) {

      const layer = new AMap.MassMarks(
        data, // only the changes of data after intialization wouldn't cause effect function fire again
        {
          zIndex, 
          opacity, 
          zooms, 
          cursor, 
          alwaysRender,
          style,
        }
      )
      map.add(layer)
      setInstance(layer)

      return () => {
        layer.clear()
        map.remove(layer)
        setInstance(null)
      }
    }
  }, 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [AMap, map, zIndex, opacity, zooms, cursor, alwaysRender, style])

  useVisible(instance, visible)

  useData(instance, data)

  useSettingProperties(instance, {style}, [
    'style',
  ])

  useEventProperties(instance, others, [
    'onComplete',
    'onClick',
    'onDblClick',
    'onMouseOut',
    'onMouseUp',
    'onMouseDown',
    'onTouchStart',
    'onTouchEnd',
  ])

  return { instance }
}