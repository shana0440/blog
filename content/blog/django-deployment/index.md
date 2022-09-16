---
title: Django Deployment
date: "2021-07-20T15:57:31.368Z"
description: "stupid me"
tags: ["writing", "python", "django"]
private: false
---

Today I'm deploy django to k8s, and it have something I will like to remember.

- The static file is gone when turn off DEBUG
  - The [document](https://docs.djangoproject.com/en/3.2/howto/static-files/) is describe the reason
  - run `python manage.py collectstatic --no-input` to collect static files to `STATIC_ROOT`
  - remove the fucking `STATICFILES_DIRS`, if the folder that defined in `STATICFILES_DIRS` didn't exist, the collectstatic will fail.
- The default `runserver` should not use in production
  - I using `gunicorn` to run the django app on production
  - `gunicorn module:application`, e.g. if you have a wsgi.py under siteconfig folder, and have a `app` variable is loaded application, use `gunicorn siteconfig.wsgi:app` to run the app

## References
- https://docs.djangoproject.com/en/3.2/howto/static-files/
- https://docs.djangoproject.com/en/3.2/howto/static-files/deployment/
- https://docs.djangoproject.com/en/3.2/howto/deployment/wsgi/gunicorn/