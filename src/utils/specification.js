
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
  const mandatory = getMandatory(parts[2]);
  return {
    id: data[0],
    size: data[1],
    mandatory,
    total: Math.max(+parts[3], mandatory.reduce((acc, { quantity }) => (acc + quantity), 0)),
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

function sumTwoFlowersArray(arr1 = [], arr2 = []) {
  const flowers = {};
  arr1.forEach(({ id, quantity }) => { flowers[id] = quantity; });
  arr2.forEach(({ id, quantity }) => { flowers[id] = (flowers[id] || 0) + quantity; });
  return Object.keys(flowers)
    .map(id => ({ id, quantity: flowers[id] }))
    .filter(({ quantity }) => !!quantity);
}

function getResultBouquet(spec, additionalFlowers) {
  const flowers = sumTwoFlowersArray(spec.mandatory, additionalFlowers);
  const flowersStr = flowers.reduce((acc, { id, quantity }) => `${acc}${quantity}${id}`, '');
  return `${spec.id}${spec.size}${flowersStr}`;
}

module.exports = {
  getSpec,
  getFlower,
  isSpecification,
  isFlower,
  sumTwoFlowersArray,
  getResultBouquet,
};
