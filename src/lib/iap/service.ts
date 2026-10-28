import { Platform } from 'react-native';
import { verifyIapPurchase, type IapGranted } from '@/lib/api';
import { ALL_PRODUCT_IDS, productId, type PlanId, type Slot } from './products';

/** Покупки в застосунку вмикаються окремо: доки бекенд і товари в магазинах не готові, екран тарифів прихований. */
export const IAP_ENABLED = process.env.EXPO_PUBLIC_IAP_ENABLED === '1';

type IapModule = typeof import('expo-iap');
let cached: Promise<IapModule | null> | null = null;

/** Нативний модуль відсутній в Expo Go — вантажимо лише за потреби й без падіння. */
function loadIap(): Promise<IapModule | null> {
  cached ??= import('expo-iap')
    .then(async (m) => {
      await m.initConnection();
      return m;
    })
    .catch(() => null);
  return cached;
}

export type StoreProduct = { id: string; displayPrice: string; title: string };

/** Локалізовані ціни з магазину за id товару. Порожній обʼєкт — магазин недоступний (Expo Go, симулятор без StoreKit). */
export async function loadStorePrices(): Promise<Record<string, StoreProduct>> {
  const iap = await loadIap();
  if (!iap) return {};
  try {
    const list = (await iap.fetchProducts({ skus: ALL_PRODUCT_IDS, type: 'subs' })) ?? [];
    return Object.fromEntries(list.map((p) => [p.id, { id: p.id, displayPrice: p.displayPrice, title: p.title }]));
  } catch {
    return {};
  }
}

/** id товарів, на які в цього Apple/Google-акаунта зараз є активна підписка (щоб знайти вільне «місце»). */
export async function activeProductIds(): Promise<string[]> {
  const iap = await loadIap();
  if (!iap) return [];
  try {
    return (await iap.getActiveSubscriptions(ALL_PRODUCT_IDS)).map((s) => s.productId);
  } catch {
    return [];
  }
}

export class PurchaseError extends Error {}

/**
 * Купує тариф для дитини. Квитанцію перевіряє сервер (`verifyIapPurchase`, повертає створену підписку) і лише після цього завершуємо
 * транзакцію в магазині, інакше Apple повторюватиме її при кожному запуску, а Google поверне гроші через 3 дні.
 */
export async function buyPlan(slot: Slot, plan: PlanId, childId: string): Promise<IapGranted> {
  const iap = await loadIap();
  if (!iap) throw new PurchaseError('Покупки доступні лише у зібраному застосунку (не в Expo Go).');
  const sku = productId(slot, plan);

  const [product] = ((await iap.fetchProducts({ skus: [sku], type: 'subs' })) ?? []) as { subscriptionOffers?: { offerTokenAndroid?: string | null }[] }[];
  if (!product) throw new PurchaseError('Цей тариф зараз недоступний у магазині.');
  const offerToken = product.subscriptionOffers?.[0]?.offerTokenAndroid ?? undefined;

  return new Promise<IapGranted>((resolve, reject) => {
    const done = (fn: () => void) => {
      updated.remove();
      failed.remove();
      fn();
    };
    const updated = iap.purchaseUpdatedListener(async (purchase) => {
      if (purchase.productId !== sku) return;
      try {
        const granted = await verifyIapPurchase({
          childId,
          productId: purchase.productId,
          platform: Platform.OS === 'ios' ? 'apple' : 'google',
          // iOS — підписана транзакція (JWS), Android — purchaseToken; сервер перевіряє в Apple/Google
          token: purchase.purchaseToken ?? '',
          transactionId: purchase.id,
        });
        await iap.finishTransaction({ purchase, isConsumable: false });
        done(() => resolve(granted));
      } catch (e) {
        done(() => reject(e instanceof Error ? e : new PurchaseError('Не вдалося підтвердити покупку.')));
      }
    });
    const failed = iap.purchaseErrorListener((err) => done(() => reject(new PurchaseError(err.message))));

    iap
      .requestPurchase({
        type: 'subs',
        request: {
          apple: { sku },
          google: { skus: [sku], subscriptionOffers: offerToken ? [{ sku, offerToken }] : undefined },
        },
      })
      .catch((e: unknown) => done(() => reject(e instanceof Error ? e : new PurchaseError('Покупку скасовано.'))));
  });
}

/** «Відновити покупки»: Apple вимагає цю кнопку. Усі знайдені покупки перевіряє сервер. */
export async function restore(childId: string): Promise<number> {
  const iap = await loadIap();
  if (!iap) throw new PurchaseError('Покупки доступні лише у зібраному застосунку (не в Expo Go).');
  await iap.restorePurchases();
  const purchases = await iap.getAvailablePurchases();
  let restored = 0;
  for (const p of purchases) {
    if (!ALL_PRODUCT_IDS.includes(p.productId)) continue;
    await verifyIapPurchase({ childId, productId: p.productId, platform: Platform.OS === 'ios' ? 'apple' : 'google', token: p.purchaseToken ?? '', transactionId: p.id });
    await iap.finishTransaction({ purchase: p, isConsumable: false });
    restored++;
  }
  return restored;
}
