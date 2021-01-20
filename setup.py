# -*- coding: utf-8 -*-
from setuptools import setup, find_packages

with open('requirements.txt') as f:
	install_requires = f.read().strip().split('\n')

# get version from __version__ variable in sentry/__init__.py
from sentry import __version__ as version

setup(
	name='sentry',
	version=version,
	description='Exception handlers',
	author='Libermatic',
	author_email='info@libermatic.com',
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
