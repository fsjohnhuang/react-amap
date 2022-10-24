import { useState } from 'react'
import isDeepEq from 'fast-deep-equal'
import isArray from '../utils/isArray'

// @returns [ Namespaces, Instances ]
// @type Namespaces { [url: string]: string }
// @type Instance { [url: string]: AMap | Loca | undefined  }
export default function useNamespacesAndInstances(pathNamespace, protocol, host, version, akey, plugin, props) {
  plugin = !plugin 
    ? undefined
    : isArray(plugin)
    ? plugin.join(',')
    : plugin

  const [ newNamespaces, newInstances ] = Object.keys(pathNamespace)
    .filter(path => props[path])
    .reduce(([ urlNamespace, urlInstance ], path) => {
      const url = `${protocol}//${host}/${path}?v=${version}&key=${akey}${plugin ? '&plugin=' + plugin : ''}`
      urlNamespace[url] = pathNamespace[path]
      urlInstance[url] = window[pathNamespace[path]]
      return [urlNamespace, urlInstance]
    }, [{}, {}])

  const [namespaces, setNamespaces] = useState(newNamespaces) 
  const [instances, setInstances] = useState(newInstances) 

  if (namespaces !== newNamespaces && !isDeepEq(namespaces, newNamespaces)) {
    setNamespaces(newNamespaces)
  }
  if (instances !== newInstances && !isDeepEq(instances, newInstances)) {
    setInstances(newInstances)
  }
  return [namespaces, instances]
}