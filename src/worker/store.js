class Store {
  constructor() {
    this.items = {};
    this.total = 0;
  }

  add(items = []) {
    let processedCount = 0;
    items.forEach(({ id, quantity = 1 }) => {
      const itemRemain = this.items[id] || 0;
      this.items[id] = itemRemain + quantity;
      this.total += quantity;
      processedCount += quantity;
    });
    return processedCount;
  }

  sub(items = []) {
    let processedCount = 0;
    items.forEach(({ id, quantity = 1 }) => {
      const itemRemain = this.items[id] || 0;
      this.items[id] = itemRemain - quantity;
      this.total -= quantity;
      processedCount += quantity;
    });
    return processedCount;
  }

  getItemsCount() {
    return Object.values(this.items)
      .reduce((acc, quantity) => (acc + quantity), 0);
  }

  checkQuantityBySpec(specification) {
    if (specification.total > this.total) {
      return false;
    }
    return specification.mandatory
      .every(({ id, quantity }) => {
        const itemRemain = this.items[id] || 0;
        return itemRemain >= quantity;
      });
  }

  static totalProportionDistribution(items = [], total = 0) {
    return Object.keys(items)
      .map(key => ({
        id: key,
        proportion: total ? items[key] / total : 0,
      }));
  }

  getStockItemDistribution() {
    return Store.totalProportionDistribution(this.items, this.total);
  }

  static getDistributedItems(requiredQuantity, distribution = []) {
    let remain = requiredQuantity;
    let maxElementQuantity = 0;
    let maxElementIndex = 0;
    const result = distribution.map(({ proportion, ...item }, index) => {
      const quantityRaw = requiredQuantity * proportion;
      const quantity = Math.round(quantityRaw);
      if (maxElementQuantity < quantityRaw) {
        maxElementQuantity = quantityRaw;
        maxElementIndex = index;
      }
      remain -= quantity;
      return {
        ...item,
        quantity,
      };
    });
    if (remain && distribution.length) {
      result[maxElementIndex].quantity += remain;
    }

    return result;
  }
}

module.exports = Store;
