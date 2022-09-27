import os
import frappe
from frappe.utils import get_build_version


def extend_bootinfo(bootinfo):
    if frappe.get_cached_value("Sentry Settings", None, "enable_sentry"):
        bootinfo.sentry = {
            "dsn": frappe.conf.get("sentry_dsn"),
            "build_version": _get_build_version(),
        }


def _get_build_version():
    if frappe.conf.developer_mode:
        return "dev"

    build_version = os.getenv("BUILD_VERSION")
    if build_version:
        return build_version

    buildtime = frappe.utils.datetime.datetime.fromtimestamp(
        frappe.utils.cint(get_build_version())
    )
    return "{}.{}.{}".format(buildtime.year % 100, buildtime.month, buildtime.day)