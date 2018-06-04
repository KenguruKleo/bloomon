const switcher = (input = '', workers = {}) => {
  const {
    small,
    large,
  } = workers;
  if (input.length > 1) {
    if (input[1] === 'L') {
      return [large];
    } else if (input[1] === 'S') {
      return [small];
    }
    return [
      small,
      large,
    ];
  }
  return [
    small,
    large,
  ];
};

module.exports = switcher;
