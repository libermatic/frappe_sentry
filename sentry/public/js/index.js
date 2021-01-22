import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';
import * as R from 'ramda';

const dsn =
  !frappe.boot.developer_mode && frappe.boot.sentry
    ? frappe.boot.sentry.dsn
    : null;

const getErrorName = R.compose(R.last, R.dropLast(1), R.split('\\n'), R.trim);

if (dsn) {
  Sentry.init({
    dsn,
    release: `frappe@${frappe.boot.versions.frappe}`,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 0.1,
  });
  Sentry.setUser({ email: frappe.boot.user.email });
  Sentry.setTag('sitename', frappe.boot.sitename);
  Sentry.setContext('apps', frappe.boot.versions);

  $(document).ajaxError(function (_event, jqXHR, ajaxSettings, thrownError) {
    const message =
      (jqXHR.responseJSON &&
        jqXHR.responseJSON.exc &&
        getErrorName(jqXHR.responseJSON.exc)) ||
      '';

    Sentry.captureMessage(thrownError || jqXHR.statusText, (scope) => {
      scope.setExtras({
        method: ajaxSettings.type,
        url: ajaxSettings.url,
        payload: ajaxSettings.data,
        status: jqXHR.status,
        message,
      });
    });
  });
}
