---
title: Permissions
description: Read your own permissions and grant permissions to others with the Java client.
---

What a user may do is decided by permissions stored in TrustDeck, see [How authorization works](/trustdeck-setup/rest-api/authentication/#how-authorization-works).

## Read permissions

`client.permissions().getOwn()` returns the authenticated user's effective permissions. `getAvailable()` returns the catalogue of actions that can be granted, and `getAvailable("PROJECT")` limits it to one resource type (`PROJECT`, `DOMAIN`, `ENTITY_TYPE`, or `GLOBAL`).

```java
List<EffectivePermission> mine = trustdeck.permissions().getOwn();
```

## Grant permissions

Permission updates synchronize a user's permissions for one resource with the given list and return the added and removed actions as a `PermissionReplacement`. Actions the requester may not grant themselves stay unchanged on the user. If the update adds such an action, the backend changes nothing and the client throws a `PermissionsRejectedException`, whose `getReplacement().getRejected()` lists the rejected actions. TrustDeck only accepts the decision `ALLOW`.

```java
try {
    PermissionReplacement result = trustdeck.project("research").permissions().update(userId, permissions);
} catch (PermissionsRejectedException e) {
    List<String> rejected = e.getReplacement().getRejected();
}
```

