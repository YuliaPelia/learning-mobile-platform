import * as WebBrowser from 'expo-web-browser';
import { API_URL } from '@/lib/config';

/**
 * Юридичний документ сайту у вбудованому браузері. `embed=1` прибирає шапку й меню сайту:
 * з них можна дійти до тарифів, а App Store забороняє вести до оплати поза застосунком.
 */
export const openDoc = (doc: 'privacy' | 'terms') => WebBrowser.openBrowserAsync(`${API_URL}/legal/${doc}?embed=1`);
