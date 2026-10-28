import { ALL_PRODUCT_IDS, freeSlot, parseProductId, productId } from '../products';

describe('каталог IAP', () => {
  it('9 товарів: 3 місця × 3 тарифи, без дублів', () => {
    expect(ALL_PRODUCT_IDS).toHaveLength(9);
    expect(new Set(ALL_PRODUCT_IDS).size).toBe(9);
  });
  it('id і розбір id взаємно обернені', () => {
    for (const id of ALL_PRODUCT_IDS) {
      const p = parseProductId(id)!;
      expect(productId(p.slot, p.plan)).toBe(id);
    }
    expect(productId(2, 'standard')).toBe('tech.itcodecraft.slot2.standard.monthly');
  });
  it('чужі й зіпсовані id не розбираються', () => {
    expect(parseProductId('com.other.app')).toBeNull();
    expect(parseProductId('tech.itcodecraft.slot4.basic.monthly')).toBeNull();
    expect(parseProductId('tech.itcodecraft.slot1.gold.monthly')).toBeNull();
  });
  it('freeSlot бере найменше вільне місце', () => {
    expect(freeSlot([])).toBe(1);
    expect(freeSlot([productId(1, 'basic')])).toBe(2);
    expect(freeSlot([productId(1, 'basic'), productId(3, 'premium')])).toBe(2);
    expect(freeSlot([productId(1, 'basic'), productId(2, 'basic'), productId(3, 'basic')])).toBeNull();
    expect(freeSlot(['чужий'])).toBe(1);
  });
});
