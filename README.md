# esup-restdb

Web service to store data from browser.

* authenticates user using CAS
* JSONP allowed for GETs
* XHR+CORS for PUT/DELETE/...
* database names should match CORS Origin, but specific ACLs allowed
* pseudo sub-table "$user" specific to each users
* for non-CAS users, "users" data is stored in localStorage via an iframe, or via cookies
