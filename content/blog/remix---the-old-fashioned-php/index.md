---
title: Remix - the old fashioned PHP
date: "2022-07-07T13:19:58.493Z"
description: "Just my some thought about Remix"
tags: ["writing", "remix", "react", "ssr"]
private: false
---

Remix, the first SSR framework I used, it make me remind when I first time using PHP.

Let me introduce a little bit about how to use Remix, in Remix project, we have a routes folder under the app folder, Remix will access the file under that folder when match the correspond url, for example, when user access `example.com/user`, Remix will execute the `app/routes/user.{jsx,tsx}`.

And each page can export a `loader` and `action` function, it is optional, the `loader` function will execute when user access the page, and the `action` will execute when user submit a form to the page, beside of the `loader` and `action`, each page must have a default export to export the view.

After we understand how to use the Remix, let us see a example page of the Remix.

```jsx
// user.jsx
export function loader = async ({ params }) {
    const user = await fetchUser(params.id);
    return user;
}

export function action = async ({ request }) {
    const form = request.formData();
    const user = await updateUser({
        id: form.get("id"),
        nickname: form.get("nickname"),
    });
}

export default function UserPage() {
    const user = useLoaderData();
    const transition = useTransition();

    return (
        <Form method="PUT" action="/user">
            <input name="nickname" defaultValue={user.nickname} />
            <input type="hidden" name="id" value={user.id} />
            <button type="submit">
                {transition.state === "submitting"
                    ? "Updating..."
                    : "Update"}
            </button>
        </Form>
    );
}
```

The about example show how to update a user data, it really simple, let us see how we do that in old fashioned PHP.

```php
// user.php
<?php
$user = fetchUser($_GET["id"]);

if ($_POST["action"] === "update") {
    $user = updateUser([
        "id" => $_POST["id"],
        "nickname" => $_POST["nickname"],
    ]);
};
?>

<html>
    <head>
        <title></title>
        ...
    </head>
    <body>
        <form method="POST" action="/user.php">
            <input name="nickname" value="<?php echo $user['nickname'] ?>" />
            <input type="hidden" name="id" value="<?php echo $user['id'] ?>" />
            <button type="submit" name="action" value="update">Update</button>
        </form>
    </body>
</html>
```

Don't you think that almost same? of course Remix provide other feature to improve the UX like `transition` and `fetcher`, `transition` used to provide the state to indicate currently is loading, submitting or loaded, ...etc, and `fetcher` provide a way to submit multiple forms separately, but the way Remix handle the request just like PHP does, and remix didn't provide the middleware, so we need to put a function like `await authRequired()` in `loader` function, it same as we need to add `isset($_SESSION["user_id"])` in `<?php ?>` block to check whether user is logged-in.

When you building a complicate web app, we have a page that require many actions, for example a profile page, it require update password, update user profile, in Remix we need to using button value to separate the action like following example.

```jsx
// profile.jsx
export function loader = async ({ params }) {
    const user = await fetchUser(params.id);
    return user;
}

export function action = async ({ request }) {
    const form = request.formData();
    if (form.get("action") === "updateProfile") {
        const user = await updateUser({
            id: form.get("id"),
            nickname: form.get("nickname"),
        });
    } else if (form.get("action") === "updatePassword") {
        const user = await updatePassword({
            id: form.get("id"),
            password: form.get("new_password"),
        });
    }
}

export default function ProfilePage() {
    const user = useLoaderData();
    const profileFetcher = useFetcher();
    const passwordFetcher = useFetcher();

    return (
        <profileFetcher.Form method="PUT" action="/user">
            <input name="nickname" defaultValue={user.nickname} />
            <input type="hidden" name="id" value={user.id} />
            <button name="action" type="submit" value="updateProfile">
                {profileFetcher.state === "submitting"
                    ? "Updating..."
                    : "Update"}
            </button>
        </profileFetcher.Form>
        <passwordFetcher.Form method="PUT" action="/user">
            <input type="password" name="new_password" />
            <input type="hidden" name="id" value={user.id} />
            <button name="action" type="submit" value="updatePassword">
                {passwordFetcher.state === "submitting"
                    ? "Updating..."
                    : "Update"}
            </button>
        </passwordFetcher.Form>
    );
}
```

The let us see the PHP example.

```php
// user.php
<?php
$user = fetchUser($_GET["id"]);

if ($_POST["action"] === "updateProfile") {
    $user = updateUser([
        "id" => $_POST["id"],
        "nickname" => $_POST["nickname"],
    ]);
} elseif ($_POST["action"] === "updatePassword") {
    $user = updatePassword([
        "id" => $_POST["id"],
        "new_password" => $_POST["new_password"],
    ]);
}
?>

<html>
    <head>
        <title></title>
        ...
    </head>
    <body>
        <form method="POST" action="/user.php">
            <input name="nickname" value="<?php echo $user['nickname'] ?>" />
            <input type="hidden" name="id" value="<?php echo $user['id'] ?>" />
            <button type="submit" name="action" value="updateProfile">Update</button>
        </form>
        <form method="POST" action="/user.php">
            <input type="password" name="new_password" />
            <input type="hidden" name="id" value="<?php echo $user['id'] ?>" />
            <button type="submit" name="action" value="updatePassword">Update</button>
        </form>
    </body>
</html>
```

This pattern is fine when your web app is not complicated, when app become more and more complicate, it is a pain in the ass, that is why no one using PHP like that anymore, and also is my main reason of give up Remix.

There have some issue I like to mention as a record, some of the problems is exists in all server side rendering framework.

1. The server side don't have `window` or `document`, every operation related to `window` or `document` can place in `useEffect` to workaround this problem, this introduce another complexity, this not easy to understand why if not familiar with SSR.
2. In SSR, we must store the user authentication information in cookie or session, so remember handle the CSRF.
3. Remember when data pass from server side, the data must become the primitive type, so remember to convert something `Date` or other non-primitive type.
4. the page navigation is not smooth as CSR, because we need to wait Remix prepared the page, so user will feel the navigate kind of leggy, the `useTransition` only help when user navigate to same page but different data, like pagination, submit form, when navigate to another page, it not help at all, and cause next problem.
5. `useTransition` include all state change on page excepted of `fetcher`, so it will change even when we navigate to other page by `Link` component, that might cause some UI issue, so I recommend use `useFetcher`, give up `useSubmit` and `useTransition`.
