---
title: iOS race conditions
date: "2021-08-31T16:44:54.801Z"
description: "About the race condition in iOS"
tags: ["writing", "ios", "swift"]
private: false
---

I'm a newbie of iOS, and this post is for swift, I don't know anything about objective-c.

The story is we have a feature is our app will send the message to our server, but if the app is offline, we will like to store the data in the local storage, and send the message after it online, to avoid store too many message, we only store the 500 message, if the message is more than 500, then we drop the old message.

Here is the sample code of this feature.

```swift
let dispatchQueue: DispatchQueue = .global(qos: .background)
let maximumMessageCount = 500

func storeMessage(message: Message) {
  dispatchQueue.async {
    let count = getMessageCount()
    if count >= maximumMessageCount {
      // TODO: drop oldest message
    }
    // TODO: store message
  }
}
```

As you can see, the above have a race condition issue, the thread might check the count smaller than 500 before we store the message, so it might have many thread pass the check, but the message already over the 500 records.

To fix this problem, we have Lock in most languages, we also have lock in swift, it call `NSLock`, it really easy to use.

```swift
let dispatchQueue: DispatchQueue = .global(qos: .background)
let maximumMessageCount = 500
let lock = NSLock()

func storeMessage(message: Message) {
  dispatchQueue.async {
    lock.lock()
    let count = getMessageCount()
    if count >= maximumMessageCount {
      // TODO: drop oldest message
    }
    // TODO: store message
    lock.unlock()
  }
}
```

But we have the better options for swift, we have the GCD, it can help you handle the concurrent code execution, in face we already using it, the dispatch queue is the GCD, but I'm not using it correctly.

```swift
// I'm not sure why the global dispatch queue will still have issue, please tell me if you know anything.
let dispatchQueue = DispatchQueue(label: "Message Queue", attributes: .concurrent)
let maximumMessageCount = 500

func storeMessage(message: Message) {
  dispatchQueue.async(flags: .barrier) {
    let count = getMessageCount()
    if count >= maximumMessageCount {
      // TODO: drop oldest message
    }
    // TODO: store message
  }
}
```

When we're using the `.barrier` flags, in that queue, only one task will be executed at a time, so don't need to worry about race condition anymore :D

## References

- https://medium.com/swiftcairo/avoiding-race-conditions-in-swift-9ccef0ec0b26
- https://developer.apple.com/documentation/dispatch/dispatchworkitemflags/1780674-barrier
- https://developer.apple.com/documentation/dispatch/dispatch_barrier
