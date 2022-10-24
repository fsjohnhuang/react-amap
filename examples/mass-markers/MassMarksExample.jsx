const citys = {
  id: 'citys', 
  url: 'https://a.amap.com/jsapi_demos/static/citys.js', 
  returns: () => { 
    if ('citys' in window) {
      return window.citys
    }
    throw Error()
  } 
}

export default function MassMarksExample() {

  return (
    <ScriptLoader
      urls={[citys]}
      parallel
      retry={3}
      fallback={<div>Loading</div>}
    >
      {({citys}) => (
        <Map>
          <MassMarkers 
            data={citys} 
            style={style} 
            opacity={0.8} 
            zIndex={111}
            cursor='pointer' 
          />
        </Map>
      )}
    </ScriptLoader>
  )
}