# esup-restdb

Web service to store data from browser.

* authenticates user using CAS/Shibboleth
* JSONP allowed for GETs (CAS only)
* XHR+CORS for PUT/DELETE/...
* database names should match CORS Origin, but specific ACLs allowed
* pseudo sub-table "$user" specific to each users
* use option ``allowRedirect`` if you allow restarting your application by redirecting to CAS/IDP. You can use option ``prompt=none`` if you are inside an iframe and do not want user to enter password inside iframe
* if the value has ``expireAt`` field, it will be used to automatically remove the value at the specified date (NB: it may last a few minutes longer)
