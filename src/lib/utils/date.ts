import dayjs from 'dayjs'

const TIMESTAMP_FORMAT = 'h:mm:ss.SSS'

export function formattedTimestamp(date: Date) {
  return dayjs(date).format(TIMESTAMP_FORMAT)
}
