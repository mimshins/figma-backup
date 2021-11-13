const timer = () => {
  let _startTime: number;
  let _endTime: number;

  const _start = () => {
    _startTime = performance.now();
  };

  const _end = () => {
    _endTime = performance.now();
    const timeDiff = (_endTime - _startTime) / 1000;

    return Math.round(timeDiff);
  };

  return { start: _start, end: _end };
};

export default timer;
