---
title: android deeplink
date: "2021-02-03T05:27:33.352Z"
description: "Just a note for handle deeplink on android"
tags: ["writing", "android", "deeplink"]
---

We have a silly problem in current project, our deeplink can work on iOS but not in android.

The reason is we miss the host & path, the following code is our original code and working code.

```xml
// original (not work)
<intent-filter android:autoVerify="true">
  <data android:scheme="kwguo">
</intent-filter>

// working code
<intent-filter android:autoVerify="true">
  <data android:scheme="kwguo" android:host="*" android:pathPattern=".*">
</intent-filter>
```

## References

- https://developer.android.com/guide/topics/manifest/data-element
