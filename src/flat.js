const flat = (array) => {
  const stack = [...array];
  const res = [];
  while(stack.length) {
    const next = stack.shift();
    if (next === undefined) {
      console.log(stack.slice(-5, -1), 'stack');
    }
    next.__children && stack.unshift(...next.__children);
    res.push(next);
  }
  return res;
}

module.exports = flat;