const Store = require('./store');

describe('Store', () => {
  it('Should create empty', () => {
    const store = new Store();
    expect(store).toEqual({
      items: {},
      total: 0,
    });
  });

  it('Should add items', () => {
    const store = new Store();
    store.add([
      { id: 'a', quantity: 22 },
      { id: 'b', quantity: 10 },
      { id: 'c', quantity: 5 },
    ]);
    expect(store).toEqual({
      items: {
        a: 22,
        b: 10,
        c: 5,
      },
      total: 37,
    });
  });

  it('Should return proportion', () => {
    const store = new Store();
    store.add([
      { id: 'a', quantity: 22 },
      { id: 'b', quantity: 10 },
      { id: 'c', quantity: 5 },
    ]);
    const stockDistribution = store.getStockItemDistribution();
    expect(stockDistribution).toEqual([
      { id: 'a', proportion: 0.5945945945945946 },
      { id: 'b', proportion: 0.2702702702702703 },
      { id: 'c', proportion: 0.13513513513513514 },
    ]);
  });

  it('Should return distribution', () => {
    const store = new Store();
    store.add([
      { id: 'a', quantity: 22 },
      { id: 'b', quantity: 10 },
      { id: 'c', quantity: 5 },
    ]);
    const stockDistribution = store.getStockItemDistribution();
    const additionalItems = Store.getDistributedItems(5, stockDistribution);
    expect(additionalItems).toEqual([
      { id: 'a', quantity: 3 },
      { id: 'b', quantity: 1 },
      { id: 'c', quantity: 1 },
    ]);
  });

  it('Should check quantity by specification', () => {
    const store = new Store();
    store.add([
      { id: 'a', quantity: 22 },
      { id: 'b', quantity: 10 },
      { id: 'c', quantity: 5 },
    ]);
    const specification = {
      id: 'A',
      mandatory: [
        { id: 'a', quantity: 10 },
        { id: 'b', quantity: 10 },
      ],
      total: 25,
    };
    expect(store.checkQuantityBySpec(specification)).toBe(true);
  });
});
