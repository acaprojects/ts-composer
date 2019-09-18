# TypeScript Composer Library

Composer is a typescript API for ACAEngine

## Compilation

You can build the library from source after installing the dependancies with the command

`npm run build`

## Usage

You can install Typescript composer with the npm command

`npm install --save-dev @acaprojects/ts-composer`

After the package is installed you can import `Composer` into your application

```typescript
import { Composer } from '@acaprojects/ts-composer'
```

Before using composer it will need to be intialised.

```typescript
Composer.init(config);
```

The init method takes a `config` object with the following properties

|Property|Description|Optional|Type|Example|
|--------|-----------|--------|----|-------|
|`host`|Host name and port of the ACAEngine server|Yes|`string`|`"dev.acaprojects.com:8080"`|
|`mock`|Whether to initialise composer with mock services|Yes|`boolean`|`true`|
|`auth_uri`|URI for authorising users session|No|`string`|`"/auth/oauth/authorize"`|
|`token_uri`|URI for generating new auth tokens|No|`string`|`"/auth/token"`|
|`redirect_uri`|URI to redirect user to after authorising session|No|`string`|`"/oauth-resp.html"`|
|`scope`|Scope of the user permissions needed by the application|No|`string`|`"admin"`|
|`storage`|Browser storage to use for storing user credentials|Yes|`"local" \| "session"`| |
|`handle_login`|Whether composer should handle user login|Yes|`boolean`|`true`|

Once initialised the `Composer` object will expose interfaces to ACAEngine's websocket and http APIs

### Websocket API

`Composer` exposes ACAEngine's websocket API through the `bindings` service.

The `bindings` service is used to provide real-time interaction with modules running on ACAEngine. It provides an interface to build efficient, responsive user interfaces, monitoring systems and other extensions which require live, two-way or asynchronous interaction.

Once composer has initialised you can listen to values on modules

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
Composer.drivers.add(driver_data).then((new_driver) => doSomething(new_driver));
Composer.drivers.show(driver_id).then((driver) => doSomething(driver));
Composer.drivers.update(driver_id, driver_data).then((updated_driver) => doSomething(updated_driver));
Composer.drivers.delete(driver_id).then(() => doSomething());

// Modules CRUD
Composer.modules.add(module_data).then((new_module) => doSomething(new_module));
Composer.modules.show(module_id).then((mod) => doSomething(mod));
Composer.modules.update(module_id, module_data).then((updated_module) => doSomething(updated_module));
Composer.modules.delete(module_id).then(() => doSomething());

// Systems CRUD
Composer.systems.add(system_data).then((new_system) => doSomething(new_system));
Composer.systems.show(system_id).then((system) => doSomething(system));
Composer.systems.update(system_id, system_data).then((updated_system) => doSomething(updated_system));
Composer.systems.delete(system_id).then(() => doSomething());

// Users CRUD
Composer.users.add(user_data).then((new_user) => doSomething(new_user)); // This will error
Composer.users.show(user_id).then((user) => doSomething(user));
Composer.users.update(user_id, user_data).then((updated_user) => doSomething(updated_user));
Composer.users.delete(user_id).then(() => doSomething());

// Zones CRUD
Composer.zones.add(zone_data).then((new_zone) => doSomething(new_zone));
Composer.zones.show(zone_id).then((zone) => doSomething(zone));
Composer.zones.update(zone_id, zone_data).then((updated_zone) => doSomething(updated_zone));
Composer.zones.delete(zone_id).then(() => doSomething());
```

The services also provide methods for the various item action endpoints


```typescript
// Driver Actions
Composer.drivers.reload(driver_id);

// Module Actions
Composer.module.start(module_id);
Composer.module.stop(module_id);
Composer.module.ping(module_id);
Composer.module.lookup(module_id, lookup);
Composer.module.internalState(module_id);

// System Actions
Composer.system.remove(system_id, module_name);
Composer.system.start(system_id);
Composer.system.stop(system_id);
Composer.system.execute(system_id, module_name, index, args);
Composer.system.state(system_id, module_name, index, lookup);
Composer.system.functionList(system_id, module_name, index);
Composer.system.types(system_id, module_name);
Composer.system.count(system_id);

// User Actions
Composer.users.current();
```

You can find more details about endpoint action on the API docs

https://app.swaggerhub.com/apis/ACAprojects/ACAEngine/3.5.0#/

## Writing mocks

If you don't have access to an ACAEngine server you can also write mocks so that you can still develop interfaces for ACAEngine.

To use the mock services you can pass `mock: true` into the initialisation object.

### Websockets

To write mocks for the the realtime(websocket) API you'll need to add your systems to `window.control.systems` before initialising composer.

```typescript
window.control.systems = {
    "my-system": {
        "MyModule": [
            {
                power: true,
                $power_on: () => this.power = true;
                $power_off: () => this.power = false;
            }
        ]
    }
}
```

Note that executable methods on mock systems are namespaced with `$` as real systems in engine allow for methods to have the same name as variables.

Once initialised interactions with a system are performed in the same manner as the live system.

```typescript
const my_mod = Composer.bindings.module('my-system', 'MyModule', 1);
const my_variable = my_mod.binding('power');
const unbind = my_variable.bind();
const sub = my_variable.listen((value) => doSomething(value)); // Emits true
my_mod.exec('power_off'); // The listen callback will now emit false 
```

Some methods may need access to other modules within the system, for this a property is appended on runtime called `_system` which allows for access to the parent system

```typescript
window.control.systems = {
    "my-system": {
        "MyModule": [
            {
                $lights_off: () => this._system.MyOtherModule[0].lights = false;
            }
        ]
        "MyOtherModule": [
            {
                lights: true,
            }
        ]
    }
}
```

### HTTP Requests

HTTP API Requests can be mocked in a similar way to the realtime API by adding handlers to `window.control.handlers`

```typescript
window.control.handlers = [
    {
        path: '/api/engine/v1/systems'
        metadata: {},
        method: 'GET',
        callback: (request) => my_mock_systems
    }
]
```

Paths allow for route parameters and will pass the value in the callback input.

```typescript
window.control.handlers = [
    {
        path: '/api/engine/v1/systems/:system_id'
        ...
        callback: (request) => 
            my_mock_systems.find(sys => sys.id === request.route_params.system_id)
    }
]
```
