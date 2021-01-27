from __future__ import unicode_literals
import frappe
from frappe.www.desk import get_build_version


def extend_bootinfo(bootinfo):
    if frappe.get_cached_value("Sentry Settings", None, "enable_sentry"):
        buildtime = frappe.utils.datetime.datetime.fromtimestamp(
            frappe.utils.cint(get_build_version())
        )
        bootinfo.sentry = {
            "dsn": frappe.conf.get("sentry_dsn"),
            "build_version": "{}.{}.{}".format(
                buildtime.year % 100, buildtime.month, buildtime.day
            ),
        }
