import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';
import * as R from 'ramda';

const dsn =
  !frappe.boot.developer_mode && frappe.boot.sentry
    ? frappe.boot.sentry.dsn
    : null;

const getErrorName = R.compose(R.last, R.dropLast(1), R.split('\\n'), R.trim);
const getTransacationName = R.compose(R.join('/'), R.take(2));

if (dsn) {
  Sentry.init({
    dsn,
    release: `frappe@${frappe.boot.versions.frappe}`,
    integrations: [
      new Integrations.BrowserTracing({
        beforeNavigate: (context) => ({
          ...context,
          name: `/${getTransacationName(frappe.get_route())}`,
        }),
      }),
    ],
    tracesSampler: ({ transactionContext, parentSampled }) => {
      if (parentSampled !== undefined) {
        return parentSampled;
      }
      if (transactionContext.name.startsWith('/modules')) {
        return 0.01;
      }
      if (transactionContext.name.startsWith('/List')) {
        return 0.05;
      }
      if (transactionContext.name.startsWith('/Form')) {
        return 0.3;
      }
      return 0.1;
    },
  });
  Sentry.setUser({ email: frappe.boot.user.email });
  Sentry.setTag('sitename', frappe.boot.sitename);
  Sentry.setContext('apps', frappe.boot.versions);

  $(document).ajaxError(function (_event, jqXHR, ajaxSettings, thrownError) {
    if (jqXHR.status < 400) {
      return;
    }

    const message =
      (jqXHR.responseJSON &&
        jqXHR.responseJSON.exc &&
        getErrorName(jqXHR.responseJSON.exc)) ||
      '';

    Sentry.captureMessage(thrownError || jqXHR.statusText, (scope) => {
      scope.setExtras(
        R.filter((x) => R.not(R.isNil(x)), {
          method: ajaxSettings.type,
          url: ajaxSettings.url,
          payload: ajaxSettings.data,
          status: jqXHR.status,
          message,
        })
      );
    });
  });
}
