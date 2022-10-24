import { useState, useEffect } from 'react'
import defaultRestrictor, { Restrictor } from '../utils/restrictor'

export default function useRestrictor(concurrency) {
  const [restrictor] = useState(() => {
    if (typeof concurrency === 'number' && concurrency > 0) {
      return new Restrictor(concurrency)
    }
    else {
      return defaultRestrictor
    }
  })
  const [state, setState] = useState(restrictor.getStatistics())

  useEffect(() => {
    const eject = restrictor.onChange(statistics => {
      setState(statistics)
    })
    return eject
  }, 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [])

  return {...state, restrict: restrictor.add}
}