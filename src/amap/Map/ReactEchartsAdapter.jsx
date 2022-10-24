import { cloneElement } from 'react'

export default function ReactEchartsAdapter(props) {
  const { children, onReady } = props

  return cloneElement(
    children, 
    { 
      onChartReady: instance => {
        // extract map instance from echarts instance
        const component = instance.getModel().getComponent('amap')
        component.setEChartsLayerInteractive(false) // make the overlay layer of AMap interactive
        const map = component.getAMap()
        onReady(map)
      }
    }
  )
}
ReactEchartsAdapter.attach = 'MapAdapter'