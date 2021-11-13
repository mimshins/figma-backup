const wait = (timeout: number) =>
  new Promise<void>(resolve => setTimeout(resolve, timeout));

export default wait;
