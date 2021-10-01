---
title: Android and iOS badge count
date: "2021-09-26T06:48:22.499Z"
description: "The difference between Android and iOS badge count"
tags: ["android", "ios", "badge count", "notification"]
private: false
---

In the current project, I need to implement badge count for Android and iOS, this post will explain the difference betwwen Android and iOS badge count, to understand the limitation of the Android and iOS badge count.

## iOS badge count

There is two way to change the badge count at iOS, change badge count locally or by push notification.

### Change badge count locally

iOS provide `UIApplication.shared.applicationIconBadgeNumber` to allow us change the badge count directly.

```swift
let currentBadgeCount = UIApplication.shared.applicationIconBadgeNumber
UIApplication.shared.applicationIconBadgeNumber = currentBadge + 1
UIApplication.shared.applicationIconBadgeNumber = 0
```

### Change badge count by push notification

In APNS (Apple Push Notification Service) payload, there have a property at `aps` call `badge`, this value of the badge will override the local badge count.

This is the example APNS payload

```json
{
  "aps": {
    "alert": "Hi, badge count"
    "badge": 10
  }
}
```

## Android badge count

Starting with API level 26, Android support notification badge, some of the launcher will make it like the iOS badge count, but it depends on launchers, so in Android we not really have a badge count, however, let's talk about Android notification badge!

Notification badge is a number that carry by each notification, when receive a notification, that notification will have a default badge number `1`, some launcher will display the sum of the notification badge number on app icon like Samsung Note 9, note it only count the notification that in notification center, so if notification is cancel, it won't be count.

We can change the badge number when we send the notification from app by using `setNumber` on notification builder, unlike iOS, this notification badge is not able set by server.

```kotlin
val notification = NotificationCompat.Builder(activity, channelID).apply {
  setContentTitle("Hi")
  setContentText("Notification count")
  setSmallIcon(android.R.color.transparent)
  setNumber(10)
}.build()
```

## The best solution or practice

## The mechanism, key techniques, and source code

# Pros/Cons

## Conclusion

## References

- https://developer.apple.com/documentation/uikit/uiapplication/1622918-applicationiconbadgenumber
- https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification
- https://developer.android.com/training/notify-user/badges
