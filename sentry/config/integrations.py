# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _


def get_data():
    return [
        {
            "label": _("Settings"),
            "items": [
                {
                    "type": "doctype",
                    "name": "Sentry Settings",
                    "label": _("Sentry Settings"),
                    "settings": 1,
                },
            ],
        },
    ]
