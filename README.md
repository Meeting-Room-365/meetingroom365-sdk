# meetingroom365-sdk
SDK for deploying a custom display on the Meeting Room 365 platform.

With just a couple lines of code, you can create a custom app that will load a display configuration, managed in Meeting Room 365, and sync its status in real-time with the admin portal.

# Examples

You can view examples on [sdk.meetingroom365.com](https://sdk.meetingroom365.com)

# Installation

### Inline (script tag)

```html
<script src="https://cdn.jsdelivr.net/npm/meetingroom365@latest"></script>
```

### NPM

```shell
npm i -s meetingroom365
```

Then, in your project:

```js
import * as Meetingroom365 from 'meetingroom365';

Meetingroom365.init();
```

## Quickstart

```html
<script src="https://cdn.jsdelivr.net/npm/meetingroom365@latest"></script>
<!-- Optional, sends information about hardware device & OS -->
<script src="https://cdn.jsdelivr.net/npm/ua-parser-js@latest"></script>
Meetingroom365.init();
```

## Usage

### Initialize a Custom App
##### Basic:
```js
Meetingroom365.init({ ...configuration }, callback<optional>)
```

##### Full options:
```js
Meetingroom365.init({
    STATUS_UPDATE_INTERVAL: 15 * 60 * 1000, // Sends a status-state update every 15 minutes to let the admin portal know the display is online
    LOCATION: true, // Sends the device's IP and derrived location (from IP) to the admin portal
    UPDATEDEVICESTATUS: true, // Update device status when updating display status-state

    key: 'manuallysetdisplaykey', // Production apps pass a display key automatically via query parameter
    
    onUpdate: function(displayConfig) {
        // Handle display configuration update from Admin portal
        console.log('Display configuration', displayConfig);
    },
})
```

Sends library configuration parameters. Not to be confused with a displayConfig object.

##### Await a Display Configuration:

```js
let displayConfig = await Meetingroom365.init({ ...configuration })
```

This is useful if you need to read the display configuration to configure your custom display before your app starts.

##### HTML Examples

You can use this library in either a normal script tag or as a module. See below:

```html
<!--As a Module-->
<script type="module">
    window._debug = true; // Enables debug output for development on Localhost

    // Fetch our display configuration
    let displayConfig = await Meetingroom365.init();

    // Handle the display configuration here if you wish to apply any customizations to the app
    
    console.log('Display Configuration loaded', displayConfig);
</script>
<!--/ As a Module-->

<!--Normal Script tag (with Callbacks)-->
<script>
    // Does the same thing, but is not a module, so is compatible with more devices and browsers
    Meetingroom365.init({}, function (displayConfig) {
        console.log('Display Configuration loaded', displayConfig);
        // Handle display configuration
    });
</script>
<!--/ Normal Script tag (with Callbacks)-->
```

### Update Display Status

You can update the display's status with arbitrary information about your display, which can appear in the Meeting Room 365 admin portal.

```js
Meetingroom365.updateStatus({ ...status })
```

For example, you can update the `{ occupied: true }` to send a "Room Occupied" status. This could be useful if you're creating a custom Dibs room display.

```js
// Example
Meetingroom365.updateStatus({ occupied: true })
```

### Ready function

A ready function is provided in case you need to wrap your app in a document ready function. This can be helpful if you need to initialize and fetch the initial display configuration after the document is ready.

`Meetingroom365.ready(() => {})`

