# TypeScript Composer Library

Composer is a typescript API for ACAEngine

## Compilation

You can build the library from source after installing the dependancies with the command

`npm run build`

## Installation

## Usage

You can install Typescript composer with the npm command

`npm install --save-dev @acaprojects/ts-composer`

After the package is installed you import `Composer` into your application

```typescript
import { Composer } from '@acaprojects/ts-composer'
```

Before using composer it will need to be intialised.

```typescript
Composer.init(config);
```

The init method takes a `config` object

|Property|Description|Optional|Type|Example|
|--------|-----------|--------|----|-------|
|host|Host name and port of the ACAEngine server|Yes|`string`|`"dev.acaprojects.com:8080"`|
|mock|Whether to initialise composer with mock services|Yes|`boolean`|`true`|
|auth_uri|URI for authorising users session|No|`string`|`"/auth/oauth/authorize"`|
|token_uri|URI for generating new auth tokens|No|`string`|`"/auth/token"`|
|redirect_uri|URI to redirect user to after authorising session|No|`string`|`"/oauth-resp.html"`|
|scope|Scope of the user permissions needed by the application|No|`string`|`"admin"`|
|storage|Browser storage to use for storing user credentials|Yes|`"local" | "session"`| |
|handle_login|Whether composer should handle user login|Yes|`boolean`|`true`|

Once initialised the `Composer` object will expose interfaces to ACAEngine's websocket and http APIs

### Websocket API

`Composer` exposes ACAEngine's websocket API through the `bindings` property.

The `bindings` service is used to provide real-time interaction with modules running on ACAEngine. It provides an interface to build efficient, responsive user interfaces, monitoring systems and other extensions which require live, two-way or asynchronous interaction.

Listening to modules can be done

```typescript
const my_mod = Composer.bindings.module('sys-death-star', 'TestModule', 3);
const my_variable = my_mod.binding('power');
const unbind = my_variable.bind();
const sub = my_variable.listen((value) => doSomething(value));
```

This binds to the `power` status variable on the 3rd `TestModule` in the system `sys-death-star`.
Any changes to the value of `power` on ACAEngine will then be emitted to the function passed to `listen`.

Other than listening to changes in values you can also remotely execute methods on modules.

```typescript
const my_mod = Composer.bindings.module('sys-death-star', 'DemoModule', 2);
my_mod.exec('power_off').then(
    (resp) => handleSuccess(resp)
    (err) => handleError(err)
);
```

This will execute the method `power_off` on the 2nd `DemoModule` in the system `sys-death-star`.
If the method doesn't exist or the system is turned off it will return an error.
The response from ACAEngine can be handled using the promise returned by the `exec` method.


### HTTP API

For the HTTP API, `Composer` provides a service for each of the root endpoints available on ACAEngine's RESTful API.

Docs for the API can be found here https://docs.acaengine.com/api/control

Services are provided for `drivers`, `modules`, `systems`, `users`, and `zones`

Each service except for `users` provides CRUD methods. `users` provides _RUD.

```typescript
// Drivers CRUD
drivers.add(driver_data).then((new_driver) => doSomething(new_driver));
drivers.show(driver_id).then((driver) => doSomething(driver));
drivers.update(driver_id, driver_data).then((updated_driver) => doSomething(updated_driver));
drivers.delete(driver_id).then(() => doSomething());

// Modules CRUD
modules.add(module_data).then((new_module) => doSomething(new_module));
modules.show(module_id).then((mod) => doSomething(mod));
modules.update(module_id, module_data).then((updated_module) => doSomething(updated_module));
modules.delete(module_id).then(() => doSomething());

// Systems CRUD
systems.add(system_data).then((new_system) => doSomething(new_system));
systems.show(system_id).then((system) => doSomething(system));
systems.update(system_id, system_data).then((updated_system) => doSomething(updated_system));
systems.delete(system_id).then(() => doSomething());

// Users CRUD
users.add(user_data).then((new_user) => doSomething(new_user)); // This will error
users.show(user_id).then((user) => doSomething(user));
users.update(user_id, user_data).then((updated_user) => doSomething(updated_user));
users.delete(user_id).then(() => doSomething());

// Zones CRUD
zones.add(zone_data).then((new_zone) => doSomething(new_zone));
zones.show(zone_id).then((zone) => doSomething(zone));
zones.update(zone_id, zone_data).then((updated_zone) => doSomething(updated_zone));
zones.delete(zone_id).then(() => doSomething());
```

The services also provide methods for the various item action endpoints

```typescript

```

## Writing mocks
