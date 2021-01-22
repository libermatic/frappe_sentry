from __future__ import unicode_literals
import frappe


def extend_bootinfo(bootinfo):
    if frappe.get_cached_value("Sentry Settings", None, "enable_sentry"):
        bootinfo.sentry = {
            "dsn": frappe.conf.get("sentry_dsn"),
        }
