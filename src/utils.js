import { useId, useCallback, useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import isArray from './utils/isArray'
import isDefaultTrue from './utils/isDefaultTrue'

export function useSettingProperties(object, props, propsName) {
  propsName.forEach(name => {
    const instance = object
    const eName = `set${name}`
    const vName = name[0].toLowerCase() + name.slice(1)
    const newValue = props[vName]
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const value = useRef(newValue)

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (instance && typeof instance[eName] === 'function' && value.current !== newValue) {
        instance[eName].apply(instance, isArray(newValue) ? newValue : [newValue])
        value.current = newValue
      }
    }, 
    [instance, newValue, eName])
  });
}

export function useEventProperties(object, props, eventName) {
  eventName.forEach(name => {
    const instance = object
    const eName = name.toLowerCase().replace(/^on/, '')
    const handler = props[name]
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (instance && eName && typeof handler === 'function') {
        instance.on(eName, handler)

        return () => {
          instance.off(eName, handler)
        }
      }
    }, [instance, handler, eName])
  })
}

export function useVisible(instance, visible = true) {
  const value = useRef(visible)

  useEffect(() => {
    if (
      instance &&
      typeof instance['show'] === 'function' &&
      typeof instance['hide'] === 'function' &&
      value.current !== visible
    ) {
      value.current = visible
      instance[visible ? 'show' : 'hide']()
    }
  }, [instance, visible])
}

export function useSetStatus(instance, props, propsName) {
  propsName.forEach(name => {
    const newValue = isDefaultTrue(props[name])
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const value = useRef(newValue)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (instance && value.current !== newValue) {
        value.current = newValue
        const status = instance.getStatus()
        instance.setStatus({
          ...status,
          [name]: newValue
        })
      }
    }, [name, newValue])
  })
}

export function usePortal() {
  const id = useId()
  const anchor = useRef((() => {
    const div = document.createElement('div')
    div.id = id
    return div
  })())

  const [anchorMounted, setAnchorMounted] = useState(false)

  const Portal = useCallback(
    function Portal({children}) {
      if (anchorMounted) {
        const container = document.getElementById(anchor.current.id)
        if (container) {
          return createPortal(children, container)
        }
      }
    },
    [anchorMounted]
  )

  return { Portal, anchor: anchor.current, setAnchorMounted }
}

export function useData(instance, data) {
  const value = useRef(data)
  useEffect(() => {
    if (instance && value.current !== data) {
      instance.setData(data)

      return () => {
        instance.clear()
      }
    }
  }, [instance, data])
}