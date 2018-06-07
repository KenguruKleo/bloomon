
function getMandatory(data) {
  const parts = data.match(/\d?\d\D/g);
  return parts.reduce((acc, item) => (
    [
      ...acc,
      { id: item.substr(-1, 1), quantity: +item.substr(0, item.length - 1) },
    ]
  ), []);
}

function getSpec(data) {
  const parts = data.match(/(..)((?:\d?\d\D)+)(\d?\d)/);
  return {
    id: data[0],
    mandatory: getMandatory(parts[2]),
    total: +parts[3],
    spec: data,
    name: data,
  };
}

function getFlower(data) {
  return {
    id: data[0],
    name: data,
  };
}

function isSpecification(data) {
  return /..(\d?\d\D)+\d?\d/.test(data);
}

function isFlower(data) {
  return /[a-z][L|S]/.test(data);
}

module.exports = {
  getSpec,
  getFlower,
  isSpecification,
  isFlower,
};
