interface WatchOptions {
  waitUntilFirstUpdate?: boolean
}

export function watch(propName: string, options?: WatchOptions) {
  return (protoOrDescriptor: any, name: string): any => {
    const { update } = protoOrDescriptor

    options = Object.assign({ waitUntilFirstUpdate: false }, options) as WatchOptions

    protoOrDescriptor.update = function (changedProps: Map<string, any>) {
      if (changedProps.has(propName)) {
        const oldValue = changedProps.get(propName)
        const newValue = this[propName]

        if (oldValue !== newValue) {
          if (!options?.waitUntilFirstUpdate || this.hasUpdated) {
            this[name].call(this, oldValue, newValue)
          }
        }
      }

      update.call(this, changedProps)
    }
  }
}
