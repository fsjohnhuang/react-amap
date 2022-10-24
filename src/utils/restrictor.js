import nextTick from "./nextTick"

const CLEANUP_TIMEOUT = 5000
const CONCURRENCY = 6
const STATUS = {
  PENDING: 0,
  RUNNING: 1,
  DONE: 2,
  ERROR: 3,
}

export class Restrictor {
  __running = false
  __notifying = false

  constructor(concurrency = CONCURRENCY, timeout = CLEANUP_TIMEOUT) {
    this.concurrency = concurrency
    this.timeout = timeout
    this.queue = []
    this.finished = []
    this.handlers = []
  }

  __run = () => {
    if (!this.__running) {
      this.__running = true
      nextTick(() => {
        this.__running = false
        const [queue, finished] = this.queue.reduce((groups, task) => {
          if (task.status <= STATUS.RUNNING) {
            groups[0].push(task)
          }
          else {
            groups[1].push(task)
          }
          return groups
        }, [[], []])

        let count = this.concurrency - queue.filter(({status}) => status === STATUS.RUNNING).length
        for (let i = 0; count > 0 && i < queue.length; i++) {
          if (queue[i].status !== STATUS.RUNNING) {
            count -= 1
            queue[i].resolve()
          }
        }

        this.queue = queue
        this.finished = this.finished.concat(finished)

        if (this.timeout > 0 && queue.length === 0) {
          this.cleanup.fd = setTimeout(this.cleanup, CLEANUP_TIMEOUT)
        }
      })
    }
  }

  __notify = () => {
    if (!this.__notifying && this.handlers.length) {
      this.__notifying = true
      nextTick(() => {
        this.__notifying = false
        const statistics = this.getStatistics()
        this.handlers.forEach(handler => handler(statistics))
      })
    }
  }

  getStatistics = () => {
    const total = this.queue.length + this.finished.length
    const {done, error, running} = this.queue.concat(this.finished).reduce(({done, error, running}, {status}) => {
      return {
        done: done + (status === STATUS.DONE ? 1 : 0),
        error: error + (status === STATUS.ERROR ? 1 : 0),
        running: running + (status === STATUS.RUNNING ? 1 : 0),
      }
    }, {done: 0, error: 0, running: 0})
        
    return {total, done, error, running}
  }

  // clean up sliently without notification.
  cleanup = () => {
    clearTimeout(this.cleanup.fd)
    delete this.cleanup.fd

    this.queue = []
    this.finished = []
  }

  add = (action, id) => {
    if (typeof action !== 'function') return action

    clearTimeout(this.cleanup.fd) // cancel cleanup intention
    const restrictor = this
    const task = {
      id: id || action.id,
      get status() {
        return this.__status
      },
      set status(value) {
        this.__status = value
        restrictor.__notify()
        restrictor.__run()
      }
    } 
    task.status = STATUS.PENDING
    restrictor.queue.push(task)

    return new Promise((resolve, reject) => {
      task.resolve = () => {
        task.status = STATUS.RUNNING
        resolve()
      }
      task.reject = error => {
        task.status = STATUS.RUNNING
        reject(error)
      }
    })
    .then(action)
    .then(data => { 
      task.status = STATUS.DONE
      return data
    }, error => {
      task.status = STATUS.ERROR
      throw error
    })
  }

  onChange = handler => {
    if (typeof handler !== 'function') return

    const index = this.handlers.length
    this.handlers.push(handler)
    handler(this.getStatistics())
    return () => {
      this.handlers.splice(index, 1)
    }
  }
}

const defaultRestrictor = new Restrictor()
export default defaultRestrictor