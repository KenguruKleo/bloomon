
function getMandatory(data) {
  const parts = data.match(/\d?\d\D/g);
  return parts.reduce((acc, item) => ({ ...acc, [item.substr(-1, 1)]: +item.substr(0, item.length - 1) }), {});
}

function getSpec(data) {
  const parts = data.match(/(..)((?:\d?\d\D)+)(\d?\d)/);
  return {
    id: data[0],
    mandatory: getMandatory(parts[2]),
    total: +parts[3],
  };
}

module.exports = {
  getSpec,
};
