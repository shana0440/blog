---
title: Testable code
date: "2020-09-08T16:08:42.007Z"
description: "How to write a testable code"
tags: ["test", "golang", "code quality"]
---

我想要寫這篇想了一陣子，最近看到 COSCUP 有個演講正好講出我心裡所想的，決定在這邊紀錄一下，順帶一提影片是 [談談 go 測試的二三事](https://www.youtube.com/watch?v=4rxMPYZdyHo&list=PLqfib4St70XPWjZqmkE2auXM50140lgut&index=58)

## SOLID

大家都知道 SOLID 指的是下面這五個原則，就我的經驗來看，有三個原則對於測試來說是最為重要的，就是 SRP & ISP & DIP。

- Single Responsibility Principle (SRP) 單一職責原則
- Open-Closed Principle (OCP) 開放封閉原則
- Liskov Substitution Principle (LSP) 里氏替換原則
- Interface Segregation Principle (ISP) 介面隔離原則
- Dependency Inversion Principle(DIP) 依賴反轉原則

### SRP

SRP 說一個類別只能做一件事情，在這個 functional programming 崛起的年代，前端提倡所謂的 pure function，也就是這個 function 只要輸入相同，就會得到相同的輸出，這樣的 function 更容易測試，我們來看一段程式。

```js
// first case
const successResults = task.filter(it => !it.error).map(it => it.result)

// second case
const successResults = task.reduce((acc, it) => {
  if (!it.error) {
    acc.push(it.result)
  }
  return acc
}, [])
```

我認為第一個比較好的原因是因為 function 只做一件事情，雖然兩個都是 pure function ，但是第一個相較於第二個更符合 SRP，如果要測試的話，第一個的測試也比較容易撰寫，而且也更不容易改動。

### ISP

[影片中](https://youtu.be/4rxMPYZdyHo?list=PLqfib4St70XPWjZqmkE2auXM50140lgut&t=1453)講到一個很重要的觀念，在寫測試的時候，我們時常需要去 mock 某個第三方物件，如果該物件的 interface 很大，那我們在 mock 的時候就要 mock 到死，但其實我們根本不用這麼多， golang 的 duck typing 在這方面給我們一個方便，假設我們有兩個 package A & B，A 需要 B 的一個 class 中的其中一個 function，我們可以在 A 中 建立一個 interface 只包含 該 function ，這樣當我們在測試的時候，我們不但可以止 mock 其中一個 function，也可以獨立測試 package A 而不需用依賴到其他 package。

```
   package         package
   uploader           s3
+-----------+   +-----------+
| S3Service |   | S3Object  |
| + put()   |   | + put()   |
| Uploader  |   | + get()   |
|           |   |           |
+-----------+   +-----------+
```

像上面的圖例，Uploader 依賴於 S3Service 而非 S3 Object，所以在測試的時候只需要 mock S3Service ，但使用上我們依然可以使用 S3Object，這種做法非常好用，但很容易沒注意到。

### DIP

DIP 提倡一個非常重要的觀念，就是注入物件而非建立物件，當我們改用注入物件，就能夠輕鬆的改成使用 mock 的物件，離提升我們的可測性。

```go
struct UserRepo {
  *db DB
}

func NewUserRepoWithDI(*db DB) {
  return UserRepo{db: db};
}

func NewUserRepoWithoutDI() {
  db := NewDB();
  return UserRepo{db: db};
}

func (repo UserRepo) CreateUser(name string) {
  repo.db.create(&User{name: name});
}
```

如果我們使用 `NewUserRepoWithoutDI` ，那撰寫測試的難度就會提高許多，因為我們要讓 `NewDB` 回傳我們的 mock db，但如果使用 `NewUserRepoWithDI` ，那只要直接傳入我們的 mock db 就行了，難易度會大幅下降。

另外使用 DIP 有個好處，那就是我們可以保證全域唯一性，過去我們要使用 singleton 來建立**單有唯一**的物件，但現在我們只要在 app launch 的時候建立好物件，之後把物件傳來傳去，也可以跟 singleton 一樣節省使用的 memory，當然如果要 lazy 就沒辦法了，但既然早晚要用到，那一開始就建立，其實沒有多大的差別，而且這麼做有個比 singleton 好的地方，是不需用每次讀取物件時都要檢查是否已經有了，並且可以避免掉 race condition，在效能上可以說是更加優秀。

## References

- https://www.youtube.com/watch?v=4rxMPYZdyHo&list=PLqfib4St70XPWjZqmkE2auXM50140lgut&index=58
