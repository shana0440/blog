---
title: Notification of iOS
date: "2021-09-05T06:31:36.397Z"
description: "How to setup notification of iOS"
tags: ["writing", "iOS", "Notification", "APNs"]
private: false
---

I'm working on iOS notification recently, the following list is used to let me follow when we working on iOS notification again.

## How to enable push notification

- Go to the apple developer portal, and make your identifiers have the capability to send the notification.
- Open the project by XCode, enable the push notification capability for your app.
- If you want to receive the remote notification, enable the Background Mode, and check the Remote notifications.

## How to register the device on APNs

Create a class to implement `UIApplicationDelegate` and `UNUserNotificationCenterDelegate`, and request notification authorization and register the remote notification when app launch.

```swift
class AppDelegate : NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
  public func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    let center = UNUserNotificationCenter.current()
    center.delegate = self
    center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
      DispatchQueue.main.async {
        if granted {
          UIApplication.shared.registerForRemoteNotifications()
        } else {
          UIApplication.shared.unregisterForRemoteNotifications()
        }
      }
      if error != nil {
        print("Failed requesting notification permission: ", error ?? "")
      }
    }
    return true
  }
}
```

## How to get the device token

Handle `didRegisterForRemoteNotificationsWithDeviceToken` callback on `AppDelegate`.

```swift
class AppDelegate : NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
  public func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    print(deviceToken.toDeviceToken())
  }
}

extension Data {
  func toDeviceToken() -> String {
    return self.map { String(format: "%02.2hhx", $0) }.joined()
  }
}
```

> The `didRegisterForRemoteNotificationsWithDeviceToken` callback only work on real device.

## Verify notification setup correctly

- Prepare the auth key before send notification, follow this [document](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/establishing_a_token-based_connection_to_apns) to understand and create the auth key.
- Follow this [document](https://developer.apple.com/documentation/usernotifications/sending_push_notifications_using_command-line_tools) to verify the notification is setup correctly.

> You can register auth key at apple developer portal.

### The problem might encounter

- The .p8 format is invalid, each line of .p8 file should be 64 chars, if the format is incorrect, openssl will not able to read the key.

## Receive remote notification

Register the follwoing delegate to receive the remote notification.

- `application(_:didReceiveRemoteNotification:)`
- `application(_:didReceiveRemoteNotification:fetchCompletionHandler:)`

The different between the two delegate, is the one have `fetchCompletionHandler` parameters can receive the notification even the app is not at foreground, the other one can only receive the remote notification when app is foreground.

## Show banner message when app in foreground

Like Android, when app in foreground, the notification won't show by default, add the following code to AppDelegate to show alert when app in foreground.

This will tell the app how to handle notification when app in the foreground.

```swift
func userNotificationCenter(
  _ center: UNUserNotificationCenter,
  willPresent notification: UNNotification,
  withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
) {
  completionHandler([.badge, .sound, .banner])
}
```

## Test notification on simulator

Although simulator didn't support register remote notification, but we still can test the notification on the simulator, we can create the notification payload file with `.apns` extension, and drog in the simulator, it will act as it receive the notification.

The `.apns` payload should look like the following json.

```json
{
  "Simulator Target Bundle": "{THE APP BUNDLE ID}",
  "aps": {
    "alert": {
      "title": "foo",
      "body": "bar"
    }
  },
  "foo": "bar"
}
```

## References

- https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/establishing_a_token-based_connection_to_apns
- https://developer.clevertap.com/docs/how-to-create-an-ios-apns-auth-key
- https://developer.apple.com/documentation/usernotifications/sending_push_notifications_using_command-line_tools
- https://developer.apple.com/forums/thread/82950
- https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623013-application
- https://developer.apple.com/documentation/usernotifications/unusernotificationcenterdelegate/1649518-usernotificationcenter
