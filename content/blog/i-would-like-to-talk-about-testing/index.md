---
title: I would like to talk about testing
date: "2021-08-07T15:07:56.924Z"
description: "My personal opinion about testable code"
tags: ["writing", "test", "code quality"]
private: false
---

Hi, today I would like to take about testing.

The story begins with a PR send by my colleague, and there have some problems I would like to talk about.

The following code is the example.

```kotlin
interface SettingRepo {
  fun setAccessToken(accessToken: String)
}

// The test objective
open class AuthController(private val settingRepo: SettingRepo) {
  var authLibraryApp: AuthLibraryApp

  init {
    // The thrid party library that we used
    AuthLibrary.create {
      authLibraryApp = it
    }
  }

  fun login(completion: (Result<String, Exception>) -> Unit) {
    authLibraryApp.login(object : AuthLibraryLoginCallback {
      override fun success(accessToken: String) {
        settingRepo.setAccessToken(accessToken)
        completion(Result.success(accessToken))
      }

      override fun failure(error: AuthLibraryError) {
        val exception = parseAuthLibraryError(error)
        completion(Result.failure(exception))
      }
    })
  }

  fun isUserDisabled(accessToken: String): Boolean {
    val user = fetchUserFromAuthLibrary(accessToken)
    return user.state == UserState.Disabled
  }

  protected fun fetchUserFromAuthLibrary(accessToken: String): User {
    return authLibraryApp.fetchUser(accessToken)
  }
}

// Test case
class MockAuthController : AuthController {
  init {}

  lateinit var fakeUser: User

  override fun fetchUserFromAuthLibrary(accessToken: String) {
    return fakeUser
  }
}

class AuthControllerTests {
  @Test
  fun testIsUserDisabled() {
    val authController = MockAuthController()
    authController.fakeUser = FakeUser()

    assertEquals(true, authController.isUserDisabled("fake_access_token"))
  }
}
```

Now, let me talk about my opinion of the above code.

First, we shouldn't let creation and business logic in the same class, it makes the code hard to test, we can't even write the test case about the login, because login depends on third party library, and it creates by `AuthController`, we have no way to mock it.

Second, the `fetchUserFromAuthLibrary` is redundant, we can totally remove the `fetchUserFromAuthLibrary`, just make `isUserDisabled` call the `authLibraryApp.fetchUser`, the only reason we create `fetchUserFromAuthLibrary` is to let us override it to test the `isUserDisabled`.

Third, just my two cents, testing a mocked test objective is cheating yourself, any implementation of test object shouldn't change, on the above example, even we didn't change the implementation of `isUserDisabled`, but the `fetchUserFromAuthLibrary` is part of `isUserDisabled`, so it shouldn't change too.

If it was me, the code will like the following.

```kotlin
interface SettingRepo {
  fun setAccessToken(accessToken: String)
}

class AuthService(
  private val settingRepo: SettingRepo,
  private val authApp: AuthLibraryApp
) {
  fun login(completion: (Result<String, Exception>) -> Unit) {
    authApp.login(object : AuthLibraryLoginCallback {
      override fun success(accessToken: String) {
        settingRepo.setAccessToken(accessToken)
        completion(Result.success(accessToken))
      }

      override fun failure(error: AuthLibraryError) {
        val exception = parseAuthLibraryError(error)
        completion(Result.failure(exception))
      }
    })
  }

  fun isUserDisabled(accessToken: String): Boolean {
    val user = authApp.fetchUser(accessToken)
    return user.state == UserState.Disabled
  }
}

// The test objective
class AuthController(private val settingRepo: SettingRepo) {
  private lateinit var authService: AuthService

  init {
    // The thrid party library that we used
    AuthLibrary.create {
      authService = AuthService(settingRepo, it)
    }
  }

  fun login(completion: (Result<String, Exception>) -> Unit) {
    authService.login(completion)
  }

  fun isUserDisabled(accessToken: String): Boolean {
    return authService.isUserDisabled(accessToken)
  }
}

// Test case
class MockSettingRepo : SettingRepo {
  var calledSetAccessTokenCount = 0
  override fun setAccessToken(accessToken: String) {
    calledSetAccessTokenCount++
  }
}

class AuthServiceTests {
  @Test
  fun testIsUserDisabled() {
    val authApp = mockk<AuthLibraryApp>()
    every { authApp.fetchUser(any()) } returns FakeUser()
    val authService = AuthService(MockSettingRepo(), authApp)

    assertEquals(true, authService.isUserDisabled("fake_access_token"))
  }

  @Test
  fun testLogin() {
    val authApp = mockk<AuthLibraryApp>()
    val slot = slot<AuthLibraryLoginCallback>()
    every { authApp.login(capture(slot)) } answers {
      slot.captured.success("fake_access_token")
    }
    val settingRepo = MockSettingRepo()
    val authService = AuthService(settingRepo, authApp)

    authService.login {
      when (it) {
        is Result.success -> {
          assertEquals("fake_access_token", it.value)
          assertEquals(1, settingRepo.calledSetAccessTokenCount)
        }
        is Result.failure -> assertFail("should be success")
      }
    }
  }
}
```

The above code separate the creation and business logic, the service didn't create anything, so it's easy to test, we can mock anything we want.
