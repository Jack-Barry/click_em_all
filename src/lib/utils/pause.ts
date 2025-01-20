export async function pause(ms: number) {
  await new Promise((res) => setTimeout(res, ms))
}
