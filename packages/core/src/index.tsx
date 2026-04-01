/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/no-named-as-default */
import ReactDOM from 'react-dom';
import React from 'react';
import 'promise-polyfill';
// eslint-disable-next-line
import registerServiceWorker from 'Utils/pwa';
import initStore from 'App/initStore';
import App from 'App/app.jsx';
import { checkAndSetEndpointFromUrl } from '@deriv/shared';
import AppNotificationMessages from './App/Containers/app-notification-messages.jsx';
import { AnalyticsInitializer } from 'Utils/Analytics';
import { getActiveAccounts, isTmbEnabled } from '@deriv/utils';

const is_ddtrader_host = window.location.hostname === 'ddtrader.netlify.app';
const current_path = window.location.pathname.replace(/\/$/, '') || '/';
const should_redirect_to_dtrader = current_path === '/' || current_path === '/index';

if (should_redirect_to_dtrader) {
    window.location.replace(`${window.location.origin}/dtrader${window.location.search}${window.location.hash}`);
} else {
    AnalyticsInitializer();

    if (is_ddtrader_host && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .getRegistrations()
                .then(registrations => Promise.all(registrations.map(registration => registration.unregister())))
                .catch(error => {
                    // eslint-disable-next-line no-console
                    console.error('Error during service worker unregister:', error);
                });

            if ('caches' in window) {
                caches.keys().then(cache_keys => Promise.all(cache_keys.map(cache_key => caches.delete(cache_key))));
            }
        });
    }

    if (
        !!window?.localStorage.getItem?.('debug_service_worker') || // To enable local service worker related development
        (!window.location.hostname.startsWith('localhost') && !/binary\.sx/.test(window.location.hostname)) ||
        window.location.hostname === 'deriv-app.binary.sx'
    ) {
        registerServiceWorker();
    }

    const has_endpoint_url = checkAndSetEndpointFromUrl();

    // if has endpoint url, APP will be redirected
    if (!has_endpoint_url) {
        const initApp = async () => {
            const is_tmb_enabled = await isTmbEnabled();
            const accounts = await getActiveAccounts();
            const root_store = is_tmb_enabled
                ? initStore(AppNotificationMessages, accounts)
                : initStore(AppNotificationMessages);

            const wrapper = document.getElementById('deriv_app');
            if (wrapper) {
                ReactDOM.render(<App useSuspense={false} root_store={root_store} />, wrapper);
            }
        };

        initApp();
    }
}
