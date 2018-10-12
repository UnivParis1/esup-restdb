# esup-restdb

Web service to store data from browser.

* authenticates user using CAS/Shibboleth
* JSONP allowed for GETs (CAS only)
* XHR+CORS for PUT/DELETE/...
* database names should match CORS Origin, but specific ACLs allowed
* pseudo sub-table "$user" specific to each users
  * "admin_xxx/$user" is forbidden, table "admin_xxx" is only accessible to admins
* use option ``allowRedirect`` if you allow restarting your application by redirecting to CAS/IDP. You can use option ``prompt=none`` if you are inside an iframe and do not want user to enter password inside iframe (use ``<SSO ... conf:ignoreNoPassive="true">`` in shibboleth2.xml)
* if the value has ``expireAt`` field, it will be used to automatically remove the value at the specified date (NB: it may last a few minutes longer)

## Configuration

### Mongo authentication

If authentication is enabled, create a shared user for database ```restdb--``` :

```
% mongo restdb-
> db.createUser({ user: 'owner', pwd: '$random', roles: [ { role: 'dbOwner', db: 'restdb-' } ] })
```

Then for each database, allow access:

```
% mongo restdb-
> db.grantRolesToUser('owner', [ { role: "dbOwner", db: "restdb-xxx" } ])
```

#### Mongo admin account

NB: you must use an account which ```~/.mongorc.js``` containing something like:

```
db.getSiblingDB('admin').auth('root', 'xxx')
```

created for example with:

```
mongo admin --eval "db.createUser({ user: 'root', pwd: '$random', roles: [ { role: 'root', db: 'admin' } ] })"
```
