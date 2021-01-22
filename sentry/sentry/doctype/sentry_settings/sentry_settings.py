# -*- coding: utf-8 -*-
# Copyright (c) 2021, Libermatic and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document


class SentrySettings(Document):
    def validate(self):
        if self.enable_sentry and not frappe.conf.get("sentry_dsn"):
            frappe.throw(
                frappe._(
                    "Cannot enable this without DSN! Please contact Administrator."
                )
            )
