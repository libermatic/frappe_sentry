from __future__ import unicode_literals
import frappe


def extend_bootinfo(bootinfo):
    bootinfo.sentry = {
        "dsn": frappe.conf.get("sentry_dsn"),
    }
