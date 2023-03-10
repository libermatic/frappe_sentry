import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';
import * as R from 'ramda';
import { getStatusMessage } from './status_codes';

const dsn =
  !frappe.boot.developer_mode && frappe.boot.sentry
    ? frappe.boot.sentry.dsn
    : null;

const getErrorName = R.compose(R.last, R.dropLast(1), R.split('\\n'), R.trim);

if (dsn) {
  Sentry.init({
    dsn,
    release: `frappe-apps@${frappe.boot.sentry.build_version}`,
    integrations: [
      new BrowserTracing({
        beforeNavigate: (context) => ({
          ...context,
          type: R.head(frappe.get_route() || []),
        }),
      }),
    ],
    tracesSampler: ({ transactionContext, parentSampled }) => {
      if (parentSampled !== undefined) {
        return parentSampled;
      }
      if (transactionContext.type === 'Workspaces') {
        return 0.01;
      }
      if (transactionContext.type === 'List') {
        return 0.03;
      }
      if (transactionContext.type === 'Form') {
        return 0.1;
      }
      return 0.05;
    },
  });
  Sentry.setUser({ email: frappe.boot.user.email });
  Sentry.setTag('sitename', frappe.boot.sitename);
  Sentry.setContext('apps', frappe.boot.versions);

  $(document).ajaxError(function (_event, jqXHR, ajaxSettings, thrownError) {
    const error = getStatusMessage(jqXHR.status);
    if (!error) {
      return;
    }

    const message =
      (jqXHR.responseJSON &&
        jqXHR.responseJSON.exc &&
        getErrorName(jqXHR.responseJSON.exc)) ||
      '';
    const text = jqXHR.responseText
      .replace(
        /<(script|style)\b[^<]*(?:(?!<\/(script|style)>)<[^<]*)*<\/(script|style)>/gi,
        ''
      )
      .replace(/(<([^>]+)>)/gi, '')
      .replace(/\s+/g, ' ');

    Sentry.captureMessage(error, (scope) => {
      scope.setExtras(
        R.filter(R.identity, {
          method: ajaxSettings.type,
          url: ajaxSettings.url,
          header:
            ajaxSettings.headers &&
            new URLSearchParams(ajaxSettings.headers).toString(),
          payload: ajaxSettings.data,
          status: jqXHR.status,
          message,
          text,
        })
      );
    });
  });
}
