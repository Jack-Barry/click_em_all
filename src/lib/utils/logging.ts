export class Logging {
  private static messagePrefix = "Click 'em All"

  static info(...args: Parameters<typeof console.log>) {
    console.log(this.messagePrefix, 'INFO:', ...args)
  }

  static debug(...args: Parameters<typeof console.debug>) {
    console.debug(this.messagePrefix, 'DEBUG:', ...args)
  }

  static error(...args: Parameters<typeof console.error>) {
    console.error(this.messagePrefix, 'ERROR:', ...args)
  }
}
