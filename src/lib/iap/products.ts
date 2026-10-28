// Товари IAP. Підписки йдуть групами за «місцем дитини» (до 3): в одній групі Apple дозволяє лише одну активну
// підписку, тож кожній дитині — своя група `slot<N>` з трьома тарифами. Курс для basic/standard обирають
// після покупки (на сервері). Id створює власниця в App Store Connect / Play Console за цією схемою.
export type Slot = 1 | 2 | 3;
export type PlanId = 'basic' | 'standard' | 'premium';

export const SLOTS: Slot[] = [1, 2, 3];
export const PLAN_IDS: PlanId[] = ['basic', 'standard', 'premium'];

/** Показується, поки магазин не повернув локалізовану ціну; ціни з сайту (грн/міс). */
export const PLAN_INFO: Record<PlanId, { name: string; description: string; priceUah: number; perks: string[] }> = {
  basic: { name: 'Простий', description: 'Один курс для самостійного навчання', priceUah: 249, perks: ['1 курс на вибір', 'Уроки, тести й домашки', 'Нагадування про домашки'] },
  standard: { name: 'Середній', description: 'Один курс з підтримкою та ігровою мотивацією', priceUah: 449, perks: ['1 курс на вибір', 'Чат підтримки', 'XP, рівні, бейджі та сертифікат'] },
  premium: { name: 'Преміум', description: 'Усі курси та особистий викладач', priceUah: 899, perks: ['Усі курси й новинки раніше за всіх', 'Викладач перевіряє домашки', 'Онлайн-зустріч з викладачем'] },
};

export const productId = (slot: Slot, plan: PlanId) => `tech.itcodecraft.slot${slot}.${plan}.monthly`;

export const ALL_PRODUCT_IDS: string[] = SLOTS.flatMap((s) => PLAN_IDS.map((p) => productId(s, p)));

export function parseProductId(id: string): { slot: Slot; plan: PlanId } | null {
  const m = /^tech\.itcodecraft\.slot([1-3])\.(basic|standard|premium)\.monthly$/.exec(id);
  return m ? { slot: Number(m[1]) as Slot, plan: m[2] as PlanId } : null;
}

/** Найменше «місце», яке ще не зайняте активною підпискою (за id товарів з магазину); null — усі зайняті. */
export function freeSlot(activeProductIds: string[]): Slot | null {
  const used = new Set(activeProductIds.map((id) => parseProductId(id)?.slot));
  return SLOTS.find((s) => !used.has(s)) ?? null;
}
